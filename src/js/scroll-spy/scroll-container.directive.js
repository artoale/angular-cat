import debounce from '../utils/debounce.service';
import windowScrollHelper from '../utils/window-scroll-helper.service';

const mod = angular.module('pa.scrollSpy.scrollContainer', [
    debounce.name,
    windowScrollHelper.name
]);

mod.directive('paScrollContainer', ($window, $timeout, paDebounce, windowScrollGetter) => {
    return {
        restrict: 'A',
        controller ($scope, $element) {
            this.spies = [];
            this.registerSpy = (spy) => {
                this.spies.push(spy);
            };

            this.getScrollContainer = () => {
                return $element[0];
            };
        },
        link (scope, elem, attrs, selfCtrl) {
            const afTimeout = 200;
            let vpHeight,
                $aWindow = angular.element($window),
                $scrollTopReference = elem[0].tagName === 'BODY' ? windowScrollGetter() : elem,
                $scroller = elem[0].tagName === 'BODY' ?
                    $aWindow : elem,
                animationFrame,
                lastScrollTimestamp = 0,
                prevTimestamp = 0;

            function onScroll() {
                lastScrollTimestamp = $window.performance.now();
                if (!animationFrame) {
                    animationFrame = $window.requestAnimationFrame(onAnimationFrame);
                }
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
                        delta = timestamp - prevTimestamp;

                selfCtrl.spies.forEach((spy)=> {
                    spy.update(viewportRect);
                });

                prevTimestamp = timestamp;
                prevTimestamp = timestamp;
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

            $aWindow.on('resize', paDebounce(onResize, 300));
            $scroller.on('scroll', onScroll);
            $timeout(onResize);
        }
    };
});

export default mod;
