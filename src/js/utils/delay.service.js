const mod = angular.module('pa.utils.delay', []);

mod.factory('paDelayS', ['$timeout', '$q', ($timeout, $q) => {
    return (millis) => {
        let deferred = $q.defer();
        $timeout(deferred.resolve.bind(deferred, millis), millis);
        return deferred.promise;
    };
}]);

export default mod;
