const mod = angular.module('pa.animations.router', []),
    directiveName = 'paRouter';

mod.directive(directiveName, ['$parse', ($parse) => {
    return {
        restrict: 'A',
        require: [directiveName, '^^?paRouter'],
        controller:  ['$q', '$scope', '$attrs', function ($q, $scope, $attrs) {
            const statusScopeVar = $attrs.paStatus;
            let isDisabled = true;

            let animations = [],
                customAnimationQueue,
                animationsMap = {},
                deferred = $q.defer(),
                status = '',
                register = (name, controller, order = 0) => {
                    animations.push({
                        name,
                        controller,
                        order,
                        pushOrder: animations.length
                    });
                    animationsMap[name] = controller;
                    controller.setDisabled(isDisabled);
                },
                setStatus = newStatus => {
                    let statusM;
                    if (statusScopeVar) {
                        statusM = $parse(statusScopeVar);
                        statusM.assign($scope, newStatus);
                    }
                    status = newStatus;
                },
                clear = (isDisabled) => {
                    if (status === 'RUNNING') {
                        deferred.resolve();
                    }

                    setStatus('CLEARING');

                    return $q.all(
                        animations.map(animation => animation.controller.clear(isDisabled))
                    ).then(() => {
                        setStatus('READY');
                    });
                },
                setUp = (isDisabled) => {
                    setStatus('READY');
                },
                runAnimation = () => {
                    let animationPromise,
                        ordered = animations.slice()
                            .sort((a, b) => {
                                let delta = a.order - b.order;
                                return delta ? delta : a.pushOrder - b.pushOrder;
                            }),
                        initDeferred = $q.defer();


                    setStatus('RUNNING');
                    initDeferred.resolve();

                    if (!customAnimationQueue) {
                        //Used for init purposes only.
                        animationPromise = ordered.reduce(
                            (prev, curr) => prev.then(
                                //Prevent animation to run if cleared
                                () =>  status === 'RUNNING' ? curr.controller.play() : prev
                            ),
                            initDeferred.promise
                        ).then(setStatus.bind(undefined, 'FINISHED'));
                    } else {
                        animationPromise = customAnimationQueue(initDeferred.promise)
                                                .then(setStatus.bind(undefined, 'FINISHED'));
                    }

                    return animationPromise;
                },
                setCustomAnimation = (animationQueue) => {
                    customAnimationQueue =  animationQueue;
                },
                play = () => {
                    if (status === 'READY') {
                        deferred = $q.defer();
                        runAnimation().then(deferred.resolve.bind(deferred));
                    }
                    return deferred.promise;
                },
                getAnimation = (animationName) => {
                    return animationsMap[animationName];
                },
                getAllAnimations = () => {
                    return animationsMap;
                },
                setDisabled = (nVal) => {
                    isDisabled = nVal;
                    if (status === 'READY') {
                        animations.forEach((animation) => {
                            animation.controller.setDisabled(isDisabled);
                        });
                    }
                };

            //APIs used by linking function
            this.setUp = setUp;
            this.runAnimation = runAnimation;
            this.setDisabled = setDisabled;

            //Public APIs
            this.play = play;
            this.clear = clear;
            this.register = register;
            this.getAnimation = getAnimation;
            this.getAllAnimations = getAllAnimations;
            this.setCustomAnimation = setCustomAnimation;

        }],
        link (scope, element, attrs, controllers) {
            const selfController = controllers[0],
                routerController = controllers[1],
                animationName = attrs.paAnimationName || directiveName,
                isDisabled = $parse(attrs.paDisabled)(scope);


            if (routerController) {
                routerController.register(animationName, selfController);
            }

            selfController.setUp();

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
                        selfController.clear(isDisabled);
                    }
                });
            }
        }
    };
}]);

export default mod;
