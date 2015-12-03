var app = angular.module('example', ['paAnimations']).run(function() {
    console.log('I am running');
});

app.directive('customAnimation', function($q, paDelayS) {
    return {
        restrict: 'A',
        require: 'paTimeline',
        link: function (scope, element, attrs, controller) {
            var first = controller.getAnimation('first');
            var second = controller.getAnimation('second');


            controller.setCustomAnimation(function(promise) {
                return promise
                    .then(function() {
                        var queue = [];
                        queue.push(first.play());
                        queue.push(second.play());
                        return $q.all(queue);
                    });
            });
        }

    };
});
