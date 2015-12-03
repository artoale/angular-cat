const mod = angular.module('cat.animations.delay', []),
    directiveName = 'catDelay';

mod.directive(directiveName, ['$parse', 'catDelayS', 'catAnimationLink', ($parse, catDelayS, catAnimationLink) => {
    return {
        restrict: 'A',
        require: [directiveName, '^^?catTimeline'],
        controller: ['$q', '$scope', '$attrs', function ($q, $scope, $attrs) {
            const millis = parseInt($attrs[directiveName], 10) || 1000,
                statusScopeVar = $attrs.catStatus;
            let isDisabled = false;

            let status = '',
                deferred = $q.defer(),


                resolve = (...args) => {
                    return deferred && deferred.resolve(args);
                },

                setStatus = newStatus => {
                    let statusM;
                    if (statusScopeVar) {
                        statusM = $parse(statusScopeVar);
                        statusM.assign($scope, newStatus);
                    }
                    status = newStatus;
                },

                setUp = () => {
                    setStatus('READY');
                },

                clear = () => {
                    let clearDeferred = $q.defer();
                    clearDeferred.resolve();

                    if (status === 'RUNNING') {
                        resolve();
                    }
                    setUp();

                    return clearDeferred.promise;
                },

                runAnimation = () => {
                    setStatus('RUNNING');
                    return catDelayS(millis).then(() => {
                        if (status === 'RUNNING') {
                            setStatus('FINISHED');
                            resolve();
                        }
                    });
                },
                play = () => {
                    if (status === 'READY') {
                        deferred = $q.defer();
                        if (isDisabled) {
                            setStatus('FINISHED');
                            resolve();
                        } else {
                            runAnimation();
                        }
                    }
                    return deferred.promise;
                },
                setDisabled = (newIsDisabled) => {
                    isDisabled = newIsDisabled;
                    setStatus('FINISHED');
                };

            //APIs used by linking function
            this.setUp = setUp;
            this.setUp = setUp;
            this.runAnimation = runAnimation;
            this.resolve = resolve;

            //Public APIs
            this.play = play;
            this.setDisabled = setDisabled;
            this.clear = clear;

        }],
        link: (...args) => catAnimationLink(...args)
    };
}]);

export default mod;
