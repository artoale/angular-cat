import scrollSpy from './scroll-spy/scroll-spy.module';
import animations from './animations/animations.module';
import delay from './utils/delay.service';

const module = angular.module('paAnimations', [
    'ngAnimate',
    animations.name,
    delay.name,
    scrollSpy.name
]);

export default module;
