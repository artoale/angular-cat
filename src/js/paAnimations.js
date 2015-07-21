import animations from './animations/animations.module';

const module = angular.module('paAnimations', [
    'ngAnimate',
    animations.name
]);

export default module;
