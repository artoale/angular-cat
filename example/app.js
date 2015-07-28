define(['./paAnimations'], function (paAnimations) {
    var app = angular.module('example', [paAnimations.name]).run(function () {
        console.log('I am running');
    });

    return app.name;
});
