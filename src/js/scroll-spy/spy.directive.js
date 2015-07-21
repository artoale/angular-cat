const spyDirective = angular.module('paSpy', []);

spyDirective.directive('paSpy', ($window) => {
    return {
        restrict: 'A',
        require: '^^paScrollSpy',
        link(scope, elem, attrs, ctrl) {
            let area = {},
                scrollContainer,
                api = {
                    update() {
                        let clientRect = elem[0].getBoundingClientRect();
                        area.top = clientRect.top + scrollContainer.scrollTop;
                        area.left = clientRect.left + scrollContainer.scrollLeft;
                        area.width = clientRect.width;
                        area.height = clientRect.height;
                    },
                    getArea() {
                        return area;
                    },
                    setInView(inView) {
                        console.log(inView);
                        scope.$evalAsync(() => {
                            scope[attrs.paSpy] = inView;
                        });
                    }
                };
            scrollContainer = ctrl.getScrollContainer() || $window.document.body;
            ctrl.registerSpy(api);
            api.update();
        }
    };
});

export default spyDirective;
