const mod = angular.module('pa.utils.windowScrollHelper', []);

mod.factory('windowScrollGetter', ['$window', ($window) => {
    return () => {
        const docEl = $window.document.documentElement;
        let scrollContainer;

        docEl.scrollTop = 1;

        if (docEl.scrollTop === 1) {
            docEl.scrollTop = 0;
            scrollContainer = docEl;
        } else {
            scrollContainer = $window.document.body;
        }

        return angular.element(scrollContainer);
    };
}]);

export default mod;
