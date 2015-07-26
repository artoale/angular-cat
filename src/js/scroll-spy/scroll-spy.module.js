import scrollSpy from './scroll-container.directive';
import spy from './visible.directive';

var mod = angular.module('pa.scrollSpy', [
    scrollSpy.name,
    spy.name
]);

//TODO: The current implementation works for scroll spies on the
// body element and for scroll divs when no parents are scrollable.
// The case where we have nested scroll elements has to be investigated.

export default mod;
