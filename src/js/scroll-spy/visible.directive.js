const mod = angular.module('pa.scrollSpy.visible', []);

mod.directive('paVisible', ($window) => {
    return {
        restrict: 'A',
        require: '^^paScrollContainer',
        link(scope, elem, attrs, ctrl) {
            let rect = {},
                scrollContainer,
                api = {
                    update() {
                        let clientRect = elem[0].getBoundingClientRect();
                        rect.top = clientRect.top + scrollContainer.scrollTop;
                        rect.left = clientRect.left + scrollContainer.scrollLeft;
                        rect.width = clientRect.width;
                        rect.height = clientRect.height;
                    },
                    getRect() {
                        return rect;
                    },
                    setInView(inView) {
                        if (scope[attrs.paVisible] !== inView) {
                            scope.$evalAsync(() => {
                                scope[attrs.paVisible] = inView;
                            });
                        }
                    }
                };
            scrollContainer = ctrl.getScrollContainer() || $window.document.body;
            ctrl.registerSpy(api);
            api.update();
        }
    };
});

export default mod;
