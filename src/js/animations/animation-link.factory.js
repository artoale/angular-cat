const mod = angular.module('cat.animations.animationLink', []);

mod.factory('catAnimationLink', () => {
    return (scope, element, attrs, controllers) => {
        let selfController = controllers[0],
            timelineController = controllers[1],
            animationName = attrs.catAnimationName;

        selfController.setUp();

        if (timelineController) {
            timelineController.register(animationName, selfController);
        }


        if (angular.isDefined(attrs.catDisabled)) {
            scope.$watch(attrs.catDisabled, (newVal) => {
                if (typeof newVal === 'boolean') {
                    selfController.setDisabled(newVal);
                }
            });
        }

        if (angular.isDefined(attrs.catActive)) {
            scope.$watch(attrs.catActive, (newVal) => {
                if (newVal) {
                    selfController.play();
                } else if (attrs.catUndo) {
                    selfController.seek('start');
                }
            });
        }
    };
});

export default mod;
