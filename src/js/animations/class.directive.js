const mod = angular.module('pa.animations.class', ['ngAnimate']),
    directiveName = 'paClass';

mod.directive(directiveName, ($animate) => {
    return {
        restrict: 'A',
        require: [],
        link(scope, element, attrs, controllers) {
            const selfController = controllers[0],
                routerController = controllers[1],
                animationName = attrs.paAnimationName || directiveName,
                className = attrs[directiveName] || directiveName,
                classNameStart = className + '--start',
                status = attrs.paStatus,
                undo = attrs.paUndo,

                setStatus = newStatus => {
                    if (status) {
                        scope[status] = newStatus;
                    }
                },
                setUp = () => {
                    setStatus('READY');
                    element.addClass(classNameStart);
                };

            if (routerController) {
                routerController.register(animationName, selfController);
            }

            setUp();

            scope.$watch(attrs.paActive, (newVal) => {
                if (newVal) {
                    setStatus('RUNNING');

                    $animate.removeClass(
                        element,
                        classNameStart
                    ).then(() => {
                        setStatus('FINISHED');
                        scope.$apply();
                    });
                } else if (undo) {
                    setUp();
                }

            });

        }
    };
});

export default mod;
