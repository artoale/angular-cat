const mod = angular.module('cat.animations.delay', []),
    directiveName = 'catDelay';

mod.directive(directiveName, ['$parse', 'catDelayS', 'catAnimationLink', 'catBaseAnimation', ($parse, catDelayS, catAnimationLink, catBaseAnimation) => {
    return {
        restrict: 'A',
        require: [directiveName, '^^?catTimeline'],
        controller: ['$q', '$scope', '$attrs', function ($q, $scope, $attrs) {
            const millis = parseInt($attrs[directiveName], 10) || 1000;

            let baseAnimation = catBaseAnimation({
                $scope: $scope,
                $attrs: $attrs,
                onPlay: () => catDelayS(millis)
            });

            //APIs used by linking function
            this.setUp = baseAnimation.setUp;
            //Public APIs
            this.seek = angular.noop;
            this.play = baseAnimation.play;
            this.setDisabled = baseAnimation.setDisabled;
            this.clear = baseAnimation.clear;

        }],
        link: (...args) => catAnimationLink(...args)
    };
}]);

export default mod;
