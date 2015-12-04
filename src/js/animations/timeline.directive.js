const mod = angular.module('cat.animations.timeline', []),
    directiveName = 'catTimeline';

mod.directive(directiveName, ['$parse', 'catAnimationLink', 'catBaseAnimation', ($parse, catAnimationLink, catBaseAnimation) => {
    return {
        restrict: 'A',
        require: [directiveName, '^^?catTimeline'],
        controller:  ['$q', '$scope', '$attrs', function ($q, $scope, $attrs) {
            let animations = [],
                runAnimation = (promise) => {
                    let ordered = animations.slice()
                        .sort((a, b) => {
                            let delta = a.order - b.order;
                            return delta ? delta : a.pushOrder - b.pushOrder;
                        });

                    return ordered.reduce(
                        (prev, curr) => prev.then(curr.controller.play),
                        promise
                    );
                },
                animationsMap = {},
                baseAnimation = catBaseAnimation({
                    onPlay: () => {
                        return runAnimation($q.when());
                    },

                    onClear: () => $q.all(
                        animations.map(animation => animation.controller.clear())
                    ),
                    disable: (isDisabled) => {
                        animations.forEach((animation) => {
                            animation.controller.setDisabled(isDisabled);
                        });
                    },
                    $scope: $scope,
                    $attrs: $attrs
                }),
                register = (name, controller, order = 0) => {
                    animations.push({
                        name,
                        controller,
                        order,
                        pushOrder: animations.length
                    });
                    animationsMap[name] = controller;
                    controller.setDisabled(baseAnimation.isDisabled);
                    if (baseAnimation.status && baseAnimation.status !== 'READY') {
                        controller.seek('end');
                    }
                },
                setCustomAnimation = (customRunAnimation) => {
                    runAnimation =  customRunAnimation;
                },
                getAnimation = (animationName) => {
                    return animationsMap[animationName];
                },
                getAllAnimations = () => {
                    return animationsMap;
                },
                seek = (progress) => {
                    animations.forEach((animation) => {
                        animation.controller.seek(progress);
                    });
                };

            //APIs used by linking function
            this.setUp = baseAnimation.setUp;

            //Public APIs
            this.play = baseAnimation.play;
            this.clear = baseAnimation.clear;
            this.setDisabled = baseAnimation.setDisabled;
            this.seek = seek;
            this.register = register;
            this.getAnimation = getAnimation;
            this.getAllAnimations = getAllAnimations;
            this.setCustomAnimation = setCustomAnimation;

        }],
        link: (...args) => catAnimationLink(...args)
    };
}]);

export default mod;
