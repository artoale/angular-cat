import classDirective from './class.directive';
import delayDirective from './delay.directive';
import routerDirective from './router.directive';
import animationLink from './animation-link.factory';

const module = angular.module('pa.animations', [
    'ngAnimate',
    classDirective.name,
    delayDirective.name,
    routerDirective.name,
    animationLink.name
]);

export default module;
