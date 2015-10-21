const mod = angular.module('pa.animations.delay', []),
    directiveName = 'paDelay';

mod.directive(directiveName, ['$parse', 'paDelayS', ($parse, paDelayS) => {
    return {
        restrict: 'A',
        require: [directiveName, '^^?paRouter'],
        controller: ['$q', '$scope', '$attrs', function ($q, $scope, $attrs) {
            const millis = parseInt($attrs[directiveName], 10) || 1000,
                statusScopeVar = $attrs.paStatus;
            let isDisabled = false;

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
                    setStatus('READY');
                },

                clear = () => {
                    let clearDeferred = $q.defer();
                    clearDeferred.resolve();

                    if (status === 'RUNNING') {
                        resolve();
                    }
                    setUp();

                    return clearDeferred.promise;
                },

                runAnimation = () => {
                    setStatus('RUNNING');
                    return paDelayS(millis).then(() => {
                        if (status === 'RUNNING') {
                            setStatus('FINISHED');
                            resolve();
                        }
                    });
                },
                play = () => {
                    if (status === 'READY') {
                        deferred = $q.defer();
                        if (isDisabled) {
                            setStatus('FINISHED');
                            resolve();
                        } else {
                            runAnimation();
                        }
                    }
                    return deferred.promise;
                },
                setDisabled = (newIsDisabled) => {
                    isDisabled = newIsDisabled;
                };

            //APIs used by linking function
            this.setUp = setUp;
            this.setUp = setUp;
            this.runAnimation = runAnimation;
            this.resolve = resolve;

            //Public APIs
            this.play = play;
            this.setDisabled = setDisabled;
            this.clear = clear;

        }],
        link(scope, element, attrs, controllers) {
            const selfController = controllers[0],
                routerController = controllers[1],
                animationName = attrs.paAnimationName || directiveName,
                isDisabled = $parse(attrs.paDisabled)(scope);

            if (routerController) {
                routerController.register(animationName, selfController);
            }

            selfController.setUp();

            scope.$watch(attrs.paDisabled, (newVal) => {
                selfController.setDisabled(newVal);
            });

            if (attrs.paActive) {
                scope.$watch(attrs.paActive, (newVal) => {
                    if (newVal) {
                        selfController.play();
                    } else if (attrs.paUndo) {
                        selfController.setUp();
                    }
                });
            }

        }
    };
}]);

export default mod;
