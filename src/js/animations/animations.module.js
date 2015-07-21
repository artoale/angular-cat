import classDirective from './class.directive';

const module = angular.module('pa.animations', [
    'ngAnimate',
    classDirective.name
]);

export default module;
