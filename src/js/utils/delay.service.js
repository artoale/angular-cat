const mod = angular.module('cat.utils.delay', []);

mod.factory('catDelayS', ['$timeout', '$q', ($timeout, $q) => {
    return (millis) => {
        let deferred = $q.defer();
        $timeout(deferred.resolve.bind(deferred, millis), millis);
        return deferred.promise;
    };
}]);

export default mod;
