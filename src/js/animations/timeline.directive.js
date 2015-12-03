const mod = angular.module('pa.animations.timeline', []),
    directiveName = 'paTimeline';

mod.directive(directiveName, ['$parse', 'paAnimationLink', ($parse, paAnimationLink) => {
    return {
        restrict: 'A',
        require: [directiveName, '^^?paTimeline'],
        controller:  ['$q', '$scope', '$attrs', function ($q, $scope, $attrs) {
            const statusScopeVar = $attrs.paStatus;
            let isDisabled = false;

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
                    if (status && status !== 'READY') {
                        controller.seek('end');
                    }
                },
                setStatus = newStatus => {
                    let statusM;
                    if (statusScopeVar) {
                        statusM = $parse(statusScopeVar);
                        statusM.assign($scope, newStatus);
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
                        if (nVal) {
                            setStatus('FINISHED');
                        }
                    }

                },
                seek = (progress) => {
                    animations.forEach((animation) => {
                        animation.controller.seek(progress);
                    });
                };

            //APIs used by linking function
            this.setUp = setUp;
            this.runAnimation = runAnimation;
            this.setDisabled = setDisabled;

            //Public APIs
            this.play = play;
            this.clear = clear;
            this.seek = seek;
            this.register = register;
            this.getAnimation = getAnimation;
            this.getAllAnimations = getAllAnimations;
            this.setCustomAnimation = setCustomAnimation;

        }],
        link: (...args) => paAnimationLink(...args)
    };
}]);

export default mod;
