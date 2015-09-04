var app = angular.module('example', ['paAnimations']).run(function() {
    console.log('I am running');
});

app.directive('customAnimation', function() {
    return {
        restrict: 'A',
        require: 'paRouter',
        link: function (scope, element, attrs, controller) {
            var first = controller.getAnimation('first');
            var second = controller.getAnimation('second');

            if (attrs.paActive) {
                scope.$watch(attrs.paActive, function(newVal) {
                    if (newVal) {
                        first.play()
                        .then(second.play)
                        .then(controller.setStatus.bind(undefined, 'FINISHED'));
                    }
                });
            }

        }

    };
});
