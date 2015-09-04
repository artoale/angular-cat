const mod = angular.module('pa.animations.router', []),
    directiveName = 'paRouter';

mod.directive(directiveName, () => {
    return {
        restrict: 'A',
        require: [directiveName, '^^?paRouter'],
        controller ($q, $scope, $attrs) {
            const statusScopeVar = $attrs.paStatus;

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
                },
                setStatus = newStatus => {
                    if (statusScopeVar) {
                        $scope[statusScopeVar] = newStatus;
                    }
                    status = newStatus;
                },
                clear = () => {
                    if (status === 'RUNNING') {
                        deferred.resolve();
                    }

                    setStatus('CLEARING');

                    return $q.all(
                        animations.map(animation => animation.controller.clear())
                    ).then(() => {
                        setStatus('READY');
                    });
                },
                setUp = () => {
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

                    if (!customAnimationQueue) {
                        //Used for init purposes only.
                        initDeferred.resolve();
                        animationPromise = ordered.reduce(
                            (prev, curr) => prev.then(
                                //Prevent animation to run if cleared
                                () =>  status === 'RUNNING' ? curr.controller.play() : prev
                            ),
                            initDeferred.promise
                        ).then(setStatus.bind(undefined, 'FINISHED'));
                    } else {
                        customAnimationQueue.trigger.resolve();
                        animationPromise = customAnimationQueue.promise
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
                };

            //APIs used by linking function
            this.setUp = setUp;
            this.runAnimation = runAnimation;

            //Public APIs
            this.play = play;
            this.clear = clear;
            this.register = register;
            this.getAnimation = getAnimation;
            this.setCustomAnimation = setCustomAnimation;

        },
        link (scope, element, attrs, controllers) {
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
                        selfController.clear();
                    }
                });
            }
        }
    };
});

export default mod;
