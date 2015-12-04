const mod = angular.module('cat.animations.base-animation', []);

mod.factory('catBaseAnimation', ['$q', '$parse', ($q, $parse) => {
    return (config) => {
        let statusScopeVar,
            setupDeferred = $q.defer(),
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
            waitForSetup = (fn) => {
                return (...args) => setupDeferred.promise.then(fn.bind(null, ...args));
            },
            seek = (progress) => {
                if (progress === 'end') {
                    finished();
                } else {
                    ready();
                }
                return config.onSeek(progress);
            },
            play = () => {
                if (status === 'READY' && !isDisabled) {
                    playDeferred = $q.defer();
                    running();

                    playDeferred.promise.then(finished, ready);

                    $q.when(config.onPlay())
                        .then(playDeferred.resolve, playDeferred.reject);

                } else if (isDisabled) {
                    seek('end');
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
                } else {
                    disableP = $q.when();
                }
                return disableP;
            },
            setUp = () => {
                $q.when(config.onSetUp()).then(ready).then(setupDeferred.resolve, setupDeferred.reject);
                return setupDeferred.promise;
            };

        if (config.$attrs && config.$attrs.catStatus) {
            statusScopeVar = config.$attrs.catStatus;
        }

        ['onPlay', 'onSetUp', 'onClear', 'disable', 'onSeek'].forEach((fun) => {
            config[fun] = typeof config[fun] === 'function' ? config[fun] : angular.noop;
        });

        return {
            play: waitForSetup(play),
            clear: waitForSetup(clear),
            seek: waitForSetup(seek),
            setDisabled: waitForSetup(setDisabled),
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
