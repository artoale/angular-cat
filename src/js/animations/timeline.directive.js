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
                    disable: (isDisabled) => {
                        animations.forEach((animation) => {
                            animation.controller.setDisabled(isDisabled);
                        });
                    },
                    onSeek: (progress) => animations.forEach((animation) => animation.controller.seek(progress)),
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
                };


            //Public APIs

            //Router specific
            this.getAllAnimations = getAllAnimations;
            this.getAnimation = getAnimation;
            this.register = register;
            this.setCustomAnimation = setCustomAnimation;

            //Animation specific
            this.play = baseAnimation.play;
            this.seek = baseAnimation.seek;
            this.setDisabled = baseAnimation.setDisabled;
            this.setUp = baseAnimation.setUp;

        }],
        link: (...args) => catAnimationLink(...args)
    };
}]);

export default mod;
