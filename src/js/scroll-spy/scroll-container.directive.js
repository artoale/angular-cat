import debounce from '../utils/debounce.service';
import windowScrollHelper from '../utils/window-scroll-helper.service';

const mod = angular.module('pa.scrollSpy.scrollContainer', [
    debounce.name,
    windowScrollHelper.name
]);

mod.directive('paScrollContainer', ['$window', '$timeout', 'paDebounce', 'windowScrollGetter', ($window, $timeout, paDebounce, windowScrollGetter) => {
    return {
        restrict: 'A',
        controller: ['$scope', '$element', function ($scope, $element) {
            this.spies = [];
            this.registerSpy = (spy) => {
                this.spies.push(spy);
            };

            this.getScrollContainer = () => {
                return $element[0];
            };
        }],
        link (scope, elem, attrs, selfCtrl) {
            const afTimeout = 400;
            let vpHeight,
                $aWindow = angular.element($window),
                $scrollTopReference = elem[0].tagName === 'BODY' ? windowScrollGetter() : elem,
                $scroller = elem[0].tagName === 'BODY' ?
                    $aWindow : elem,
                animationFrame,
                lastScrollTimestamp = 0,
                scrollPrevTimestamp = 0,
                previousScrollTop = 0;

            function onScroll() {
                lastScrollTimestamp = $window.performance.now();
                if (!animationFrame) {
                    animationFrame = $window.requestAnimationFrame(onAnimationFrame);
                }
                scrollPrevTimestamp = $window.performance.now();
            }

            function onResize() {
                vpHeight = Math.max($window.document.documentElement.clientHeight, window.innerHeight || 0);
                selfCtrl.spies.forEach((spy)=> {
                    spy.updateClientRect();
                });
                onScroll();
            }

            function onAnimationFrame() {
                const viewportRect = getViewportRect(),
                        timestamp = $window.performance.now(),
                        delta = timestamp - scrollPrevTimestamp,
                        scrollDelta = viewportRect.top - previousScrollTop,
                        scrollDirection = scrollDelta === 0 ? 0 :
                            scrollDelta / Math.abs(scrollDelta);

                selfCtrl.spies.forEach((spy)=> {
                    spy.update(viewportRect, scrollDirection);
                });

                previousScrollTop = viewportRect.top;

                if (delta < afTimeout) {
                    queueAf();
                } else {
                    cancelAf();
                }
            }

            function getViewportRect() {
                const currentScroll = $scrollTopReference[0].scrollTop;
                return {
                    top: currentScroll,
                    height: vpHeight
                };
            }

            function queueAf() {
                animationFrame = $window.requestAnimationFrame(onAnimationFrame);
            }

            function cancelAf() {
                $window.cancelAnimationFrame(animationFrame);
                animationFrame = null;
            }

            scope.$on('paScrollContainer:updateSpies', onResize);

            if (angular.isDefined(attrs.triggerUpdate)) {
                scope.$watch(attrs.triggerUpdate, function (newVal, oldVal) {
                    if (newVal !== oldVal) {
                        $timeout(function () {
                            onResize();
                        }, 0);
                    }
                });
            }

            $aWindow.on('resize', paDebounce(onResize, 300));
            $scroller.on('scroll', onScroll);
            $timeout(onResize);
        }
    };
}]);

export default mod;
