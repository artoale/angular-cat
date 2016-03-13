import animations from './animations/animations.module';
import delay from './utils/delay.service';

const module = angular.module('cat', [
    'ngAnimate',
    animations.name,
    delay.name
]);

export default module;
