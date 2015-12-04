import animationLink from './animation-link.factory';
import baseAnimation from './base-animation.factory';
import classDirective from './class.directive';
import delayDirective from './delay.directive';
import timelineDirective from './timeline.directive';

const module = angular.module('cat.animations', [
    'ngAnimate',
    animationLink.name,
    baseAnimation.name,
    classDirective.name,
    delayDirective.name,
    timelineDirective.name
]);

export default module;
