const mod = angular.module('pa.animations.animationLink', []);

mod.factory('paAnimationLink', () => {
    return (scope, element, attrs, controllers) => {
        let selfController = controllers[0],
            timelineController = controllers[1],
            animationName = attrs.paAnimationName;

        if (timelineController) {
            timelineController.register(animationName, selfController);
        }

        selfController.setUp();

        if (angular.isDefined(attrs.paDisabled)) {
            scope.$watch(attrs.paDisabled, (newVal) => {
                if (typeof newVal === 'boolean') {
                    selfController.setDisabled(newVal);
                }
            });
        }

        if (angular.isDefined(attrs.paActive)) {
            scope.$watch(attrs.paActive, (newVal) => {
                if (newVal) {
                    selfController.play();
                } else if (attrs.paUndo) {
                    selfController.clear();
                }
            });
        }
    };
});

export default mod;
