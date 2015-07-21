const scrollSpyDirective = angular.module('paScrollSpy', []);

scrollSpyDirective.directive('paScrollSpy', ($window, $timeout, paDebounce) => {
    return {
        restrict: 'A',
        controller($scope, $element) {
            $scope.spies = [];
            this.registerSpy = (spy) => {
                $scope.spies.push(spy);
            };

            this.getScrollContainer = () => {
                return $element[0];
            };
        },
        link(scope, elem) {
            let vpHeight = Math.max(document.documentElement.clientHeight, window.innerHeight || 0),
                $aWindow = angular.element($window),
                scroller = elem[0].tagName === 'BODY' ? $aWindow : elem;

            function onScroll() {
                $window.requestAnimationFrame(onAnimationFrame);
            }

            function onResize() {
                vpHeight = Math.max(document.documentElement.clientHeight, window.innerHeight || 0);
                scope.spies.forEach((spy)=> {
                    spy.update();
                });
                $window.requestAnimationFrame(onAnimationFrame);
            }

            function onAnimationFrame() {
                const currentScroll = elem[0].scrollTop,
                    viewportArea = {
                        top: currentScroll,
                        height: vpHeight
                    };

                scope.spies.forEach((spy)=> {
                    let spyArea = spy.getArea();
                    if ((spyArea.top >= viewportArea.top && (spyArea.top + spyArea.height) <= (viewportArea.top + viewportArea.height)) ||
                        (spyArea.top < viewportArea.top && (spyArea.height) >= vpHeight)) {
                        spy.setInView(true);
                    } else {
                        spy.setInView(false);
                    }
                });

            }

            $aWindow.on('resize', paDebounce(onResize, 300));

            scroller.on('scroll', onScroll);
        }
    };
});

export default scrollSpyDirective;
