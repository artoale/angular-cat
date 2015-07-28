import classDirective from './class.directive';
import videoDirective from './video.directive';
import delayDirective from './delay.directive';
import routerDirective from './router.directive';

const module = angular.module('pa.animations', [
    'ngAnimate',
    classDirective.name,
    videoDirective.name,
    delayDirective.name,
    routerDirective.name
]);

export default module;
