var app = angular.module('example', ['paAnimations']).run(function() {
    console.log('I am running');
});

app.directive('customAnimation', function($q, paDelayS) {
    return {
        restrict: 'A',
        require: 'paRouter',
        link: function (scope, element, attrs, controller) {
            var first = controller.getAnimation('first');
            var second = controller.getAnimation('second');
            var trigger = $q.defer();
            var queue = trigger.promise
                .then(function() {
                    var queue = [];
                    queue.push(first.play());
                    queue.push(second.play());
                    return $q.all(queue);
                });

            controller.setCustomAnimation({
                trigger: trigger,
                promise: queue
            });
        }

    };
});
