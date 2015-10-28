const mod = angular.module('pa.animations.class', []),
    directiveName = 'paClass';

mod.directive(directiveName, ['$animate', '$parse',($animate, $parse) => {
    return {
        restrict: 'A',
        require: [directiveName, '^?paRouter'],
        controller: ['$q', '$scope', '$attrs', '$element', function ($q, $scope, $attrs, $element) {
            const className = $attrs[directiveName] || directiveName,
                classNameStart = className + '--start',
                statusScopeVar = $attrs.paStatus;

            let status = '',
                deferred,


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
                    $element.css({
                        transition: 'none'
                    });

                    $element.addClass(classNameStart);

                    $element.css({
                        transition: ''
                    });
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
                    $element.css({
                        transition: ''
                    });
                },
                setDisabled = (isDisabled) => {
                    if (status === 'READY') {
                        if (isDisabled) {
                            seek('end');
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
        link (scope, element, attrs, controllers) {
            const selfController = controllers[0],
                routerController = controllers[1],
                animationName = attrs.paAnimationName || directiveName,
                isDisabled = $parse(attrs.paDisabled)(scope);

            if (routerController) {
                routerController.register(animationName, selfController);
            }

            selfController.setUp(isDisabled);

            if (angular.isDefined(attrs.paDisabled)) {
                scope.$watch(attrs.paDisabled, (newVal) => {
                    if (typeof newVal === 'boolean') {
                        selfController.setDisabled(newVal);
                    }
                });
            }

            if (angular.isDefined(attrs.paActive)) {
                scope.$watch(attrs.paActive, (newVal) => {
                    if (newVal) {
                        selfController.runAnimation();
                    } else if (attrs.paUndo) {
                        selfController.setUp();
                    }
                });
            }

        }
    };
}]);

export default mod;
