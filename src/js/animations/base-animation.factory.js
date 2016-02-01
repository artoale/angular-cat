const mod = angular.module('cat.animations.baseAnimation', []);

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
            seeking = statusSetter('SEEKING'),
            ready = statusSetter('READY'),
            finished = statusSetter('FINISHED'),
            waitForSetup = (fn) => {
                return (...args) => setupDeferred.promise.then(fn.bind(null, ...args));
            },
            seek = (progress) => {
                let onSeeked = progress === 'end' ? finished : ready;
                if (status === 'RUNNING') {
                    playDeferred.reject(); // Maybe reject?
                }
                seeking();
                return $q.when(config.onSeek(progress)).then(onSeeked);
            },
            play = () => {
                if (status === 'READY' && !isDisabled) {
                    playDeferred = $q.defer();
                    running();

                    playDeferred.promise.then(finished);

                    $q.when(config.onPlay())
                        .then(playDeferred.resolve, playDeferred.reject);

                } else if (isDisabled) {
                    seek('end');
                }
                return playDeferred.promise;
            },
            setDisabled = (newIsDisabled) => {
                isDisabled = newIsDisabled;

                if (newIsDisabled) {
                    if (status === 'READY') {
                        seek('start');
                    } else {
                        seek('end');
                    }
                }
                return $q.when(config.disable(newIsDisabled));
            },
            setUp = () => {
                $q.when(config.onSetUp()).then(ready).then(setupDeferred.resolve, setupDeferred.reject);
                return setupDeferred.promise;
            };

        if (config.$attrs && config.$attrs.catStatus) {
            statusScopeVar = config.$attrs.catStatus;
        }

        ['onPlay', 'onSetUp', 'disable', 'onSeek'].forEach((fun) => {
            config[fun] = typeof config[fun] === 'function' ? config[fun] : angular.noop;
        });

        return {
            play: waitForSetup(play),
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
