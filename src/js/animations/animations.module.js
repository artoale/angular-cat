import classDirective from './class.directive';
import routerDirective from './router.directive';

const module = angular.module('pa.animations', [
    'ngAnimate',
    classDirective.name,
    routerDirective.name
]);

export default module;
