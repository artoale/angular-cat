const mod = angular.module('cat.animations.base-animation', []);

mod.factory('catBaseAnimation', ['$q', '$parse', ($q, $parse) => {
    return (config) => {
        let statusScopeVar,
            playDeferred = $q.defer(),
            status = '',
            isDisabled = false,
            statusSetter = (newStatus) => () => {
                let statusM;
                if (statusScopeVar) {
                    statusM = $parse(statusScopeVar);
                    statusM.assign(config.$scope, newStatus);
                }
                status = newStatus;
            },
            running = statusSetter('RUNNING'),
            clearing = statusSetter('CLEARING'),
            ready = statusSetter('READY'),
            finished = statusSetter('FINISHED'),
            play = () => {
                if (status === 'READY') {
                    playDeferred = $q.defer();
                    running();

                    playDeferred.promise.then(finished, ready);

                    $q.when(config.onPlay())
                        .then(playDeferred.resolve, playDeferred.reject);

                }
                return playDeferred.promise;
            },
            clear = () => {
                if (status === 'RUNNING') {
                    playDeferred.reject(); // Maybe reject?
                }
                clearing();

                return $q.when(config.onClear())
                .then(ready);
            },
            setDisabled = (newIsDisabled) => {
                let disableP;
                isDisabled = newIsDisabled;
                if (status === 'READY') {
                    disableP = $q.when(config.disable());
                    disableP = newIsDisabled ? disableP.then(finished) : disableP;
                } else {
                    disableP = $q.when();
                }
                return disableP;
            },
            setUp = () => {
                return $q.when(config.onSetUp()).then(ready);
            };

        if (config.$attrs && config.$attrs.catStatus) {
            statusScopeVar = config.$attrs.catStatus;
        }
        return {
            play,
            clear,
            setDisabled,
            setUp,
            get status() {
                return status;
            },
            get isDisabled() {
                return isDisabled;
            }
        };
    };
}]);

export default mod;
