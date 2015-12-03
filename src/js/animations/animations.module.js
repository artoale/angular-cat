import classDirective from './class.directive';
import delayDirective from './delay.directive';
import timelineDirective from './timeline.directive';
import animationLink from './animation-link.factory';

const module = angular.module('cat.animations', [
    'ngAnimate',
    classDirective.name,
    delayDirective.name,
    timelineDirective.name,
    animationLink.name
]);

export default module;
