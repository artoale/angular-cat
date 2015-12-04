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
                },
                onClear: () => {
                    seek('start');
                },
                disable: (isDisabled) => {
                    let seekTo = isDisabled ? 'end' : 'start';
                    seek(seekTo);
                }
            });


            //Public APIs
            this.setUp = baseAnimation.setUp;
            this.setDisabled = baseAnimation.setDisabled;
            this.play = baseAnimation.play;
            this.clear = baseAnimation.clear;
            this.seek = baseAnimation.seek;

        }],
        link: (...args) => catAnimationLink(...args)
    };
}]);

export default mod;
