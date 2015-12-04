const mod = angular.module('cat.animations.class', []),
    directiveName = 'catClass';

mod.directive(directiveName, ['$animate', '$parse', '$timeout', 'catAnimationLink', ($animate, $parse, $timeout, catAnimationLink) => {
    return {
        restrict: 'A',
        require: [directiveName, '^?catTimeline'],
        controller: ['$q', '$scope', '$attrs', '$element', function ($q, $scope, $attrs, $element) {
            const className = $attrs[directiveName] || directiveName,
                classNameStart = className + '--start',
                statusScopeVar = $attrs.catStatus;

            let status = '',
                deferred = $q.defer(),


                resolve = (...args) => {
                    return deferred && deferred.resolve(args);
                },

                setStatus = newStatus => {
                    let statusM;
                    if (statusScopeVar) {
                        statusM = $parse(statusScopeVar);
                        statusM.assign($scope, newStatus);
                    }
                    status = newStatus;
                },

                setUp = () => {
                    // FIXME: do we need to have a different state when an animation
                    // is disabled?
                    setStatus('READY');
                    if (!$element.hasClass(className)) {
                        $element.addClass(className);
                    }

                    seek('start');
                },

                clear = () => {
                    let clearDeferred = $q.defer();
                    clearDeferred.resolve();

                    if (status === 'RUNNING') {
                        //TODO we might want to reject this to handle this
                        //usecase, needs more cowbell
                        resolve();
                    }
                    setUp();

                    return clearDeferred.promise;
                },

                runAnimation = () => {
                    setStatus('RUNNING');

                    $animate.removeClass(
                        $element,
                        classNameStart
                    ).then(() => {
                        if (status === 'RUNNING') {
                            setStatus('FINISHED');
                            resolve();
                        }
                    });

                },
                play = () => {
                    if (status === 'READY') {
                        deferred = $q.defer();
                        runAnimation();
                    }
                    return deferred.promise;
                },
                seek = (progress) => {
                    $element.css({
                        transition: 'none'
                    });
                    if (progress === 'end') {
                        $element.removeClass(classNameStart);
                    } else if (progress === 'start') {
                        $element.addClass(classNameStart);
                    }
                    $timeout(() => $element.css({
                        transition: ''
                    }), 0, false); // skip $apply
                },
                setDisabled = (isDisabled) => {
                    if (status === 'READY') {
                        if (isDisabled) {
                            seek('end');
                            setStatus('FINISHED');
                        } else {
                            seek('start');
                        }
                    }
                };

            //APIs used by linking function
            this.runAnimation = runAnimation;
            this.resolve = resolve;

            //Public APIs
            this.setUp = setUp;
            this.setDisabled = setDisabled;
            this.play = play;
            this.clear = clear;
            this.seek = seek;

        }],
        link: (...args) => catAnimationLink(...args)
    };
}]);

export default mod;
