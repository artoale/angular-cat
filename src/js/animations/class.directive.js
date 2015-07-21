const mod = angular.module('pa.animations.class', []),
    directiveName = 'paClass';

mod.directive(directiveName, ($animate) => {
    return {
        restrict: 'A',
        require: [directiveName, '^?paRouter'],
        controller($q, $scope, $attrs, $element) {
            const className = $attrs[directiveName] || directiveName,
                classNameStart = className + '--start',
                statusScopeVar = $attrs.paStatus;

            let status = '',
                deferred,


                resolve = (...args) => {
                    return deferred && deferred.resolve(args);
                },

                setStatus = newStatus => {
                    if (statusScopeVar) {
                        $scope[statusScopeVar] = newStatus;
                    }
                    status = newStatus;
                },

                setUp = () => {
                    setStatus('READY');
                    $element.addClass(classNameStart);
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
                };

            //APIs used by linking function
            this.setUp = setUp;
            this.runAnimation = runAnimation;
            this.resolve = resolve;

            //Public APIs
            this.play = play;
            this.clear = clear;

        },
        link(scope, element, attrs, controllers) {
            const selfController = controllers[0],
                routerController = controllers[1],
                animationName = attrs.paAnimationName || directiveName;

            if (routerController) {
                routerController.register(animationName, selfController);
            }

            selfController.setUp();
            if (attrs.paActive) {
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
});

export default mod;
