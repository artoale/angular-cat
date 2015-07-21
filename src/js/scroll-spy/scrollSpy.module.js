import scrollSpy from './scrollSpy.directive';
import spy from './spy.directive';

var module = angular.module('paScrollSpyModule', [scrollSpy.name, spy.name]).run(() => {
    console.log('ScrollSpy module run!');
});

//TODO: The current implementation works for scroll spies on the
// body element and for scroll divs when no parents are scrollable.
// The case where we have nested scroll elements has to be investigated.

export default module;
