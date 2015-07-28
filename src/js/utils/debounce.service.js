const mod = angular.module('pa.utils.debounce', []);

mod.factory('paDebounce', ['$timeout', '$q', ($timeout, $q) => {
    return (func, wait, immediate) => {
        let timeout,
            deferred = $q.defer();

        return (...args) => {
            const context = this,
                later = () => {
                    timeout = null;
                    if (!immediate) {
                        deferred.resolve(func.apply(context, args));
                        deferred = $q.defer();
                    }
                },
                callNow = immediate && !timeout;
            if (timeout) {
                $timeout.cancel(timeout);
            }
            timeout = $timeout(later, wait);
            if (callNow) {
                deferred.resolve(func.apply(context, args));
                deferred = $q.defer();
            }
            return deferred.promise;
        };
    };
}]);

export default mod;
