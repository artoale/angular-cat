import classDirective from './animations/class.directive';

const module = angular.module('paAnimations', [
    'ngAnimate',
    classDirective.name
]);

export default module;
