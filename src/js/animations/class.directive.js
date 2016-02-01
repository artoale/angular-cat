const mod = angular.module('cat.animations.class', []),
    directiveName = 'catClass';

mod.directive(directiveName, ['$animate', '$parse', '$timeout', 'catAnimationLink', 'catBaseAnimation', ($animate, $parse, $timeout, catAnimationLink, catBaseAnimation) => {
    return {
        restrict: 'A',
        require: [directiveName, '^?catTimeline'],
        controller: ['$q', '$scope', '$attrs', '$element', function ($q, $scope, $attrs, $element) {
            const className = $attrs[directiveName] || directiveName,
                classNameStart = className + '--start';

            let seek = (progress) => {
                $element.css({
                    transition: 'none'
                });
                if (progress === 'end') {
                    $element.removeClass(classNameStart);
                } else if (progress === 'start') {
                    $element.addClass(classNameStart);
                }
                // Force relayout
                $element[0].offsetHeight; //jshint ignore:line
                $element.css({
                    transition: ''
                });
            };

            let baseAnimation = catBaseAnimation({
                $scope: $scope,
                $attrs: $attrs,
                onSeek: seek,
                onPlay: () => $animate.removeClass(
                    $element,
                    classNameStart
                ),
                onSetUp: () => {
                    if (!$element.hasClass(className)) {
                        $element.addClass(className);
                    }

                    seek('start');
                }
            });

            //APIs used by linking function
            this.setUp = baseAnimation.setUp;

            //Public APIs
            this.play = baseAnimation.play;
            this.seek = baseAnimation.seek;
            this.setDisabled = baseAnimation.setDisabled;

        }],
        link: (...args) => catAnimationLink(...args)
    };
}]);

export default mod;
