import debounce from '../utils/debounce.service';
const mod = angular.module('pa.scrollSpy.scrollContainer', [debounce.name]);

mod.directive('paScrollContainer', ($window, $timeout, paDebounce) => {
    return {
        restrict: 'A',
        controller($scope, $element) {
            this.spies = [];
            this.registerSpy = (spy) => {
                this.spies.push(spy);
            };

            this.getScrollContainer = () => {
                return $element[0];
            };
        },
        link(scope, elem, attrs, selfCtrl) {
            let vpHeight,
                $aWindow = angular.element($window),
                scroller = elem[0].tagName === 'BODY' ? $aWindow : elem;

            function onScroll() {
                $window.requestAnimationFrame(onAnimationFrame);
            }

            function onResize() {
                vpHeight = Math.max($window.document.documentElement.clientHeight, window.innerHeight || 0);
                selfCtrl.spies.forEach((spy)=> {
                    spy.update();
                });
                $window.requestAnimationFrame(onAnimationFrame);
            }

            function onAnimationFrame() {
                const currentScroll = elem[0].scrollTop,
                    viewportRect = {
                        top: currentScroll,
                        height: vpHeight
                    };

                selfCtrl.spies.forEach((spy)=> {
                    let spyRect = spy.getRect(),
                        isFullyVisible = (spyRect.top >= viewportRect.top && //Top border in viewport
                            (spyRect.top + spyRect.height) <= (viewportRect.top + viewportRect.height)) || //Bottom border in viewport
                            (spyRect.top < viewportRect.top && (spyRect.height) >= vpHeight), // Bigger than viewport
                        isFullyHidden = !isFullyVisible &&
                            spyRect.top > (viewportRect.top + viewportRect.height) || //Top border below viewport bottom
                            (spyRect.top + spyRect.height) < viewportRect.top; //Bottom border above viewport top


                    //Only change state when fully visible/hidden
                    if (isFullyVisible) {
                        spy.setInView(true);
                    } else if (isFullyHidden) {
                        spy.setInView(false);
                    }
                });

            }

            $aWindow.on('resize', paDebounce(onResize, 300));
            scroller.on('scroll', onScroll);
            onResize();
        }
    };
});

export default mod;
