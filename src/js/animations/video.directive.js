const mod = angular.module('pa.animations.video', []),
    directiveName = 'paVideo';

mod.directive(directiveName, () => {
    return {
        restrict: 'A',
        require: [directiveName, '^?paRouter'],
        controller($q, $scope, $attrs, $element, $timeout) {
            const $videoElement = $element.find('video'),
                statusScopeVar = $attrs.paStatus,
                readyDeferred = $q.defer();

            let status = '',
                deferred,
                periodicCheckPromise,
                buffered = 0,

                setStatus = newStatus => {
                    if (statusScopeVar) {
                        $scope[statusScopeVar] = newStatus;
                    }
                    status = newStatus;
                },

                resolve = (...args) => {
                    if (status === 'RUNNING') {
                        $scope.$apply(setStatus('FINISHED'));
                    }
                    return deferred && deferred.resolve(args);
                },

                ready = () => {
                    return readyDeferred.promise;
                },

                checkReady = (duration, buffered) => {
                    if (Math.abs(duration - buffered) < 1) {
                        console.log('it is ready');
                        $videoElement.off('progress');
                        $videoElement.off('loadedmetadata');
                        $timeout.cancel(periodicCheckPromise);
                        readyDeferred.resolve();
                    }
                },

                progressHandler = () => {
                    var videoBuffered = $videoElement[0].buffered;
                    var i;

                    buffered = 0;

                    for (i = 0; i < videoBuffered.length; i += 1) {
                        buffered += videoBuffered.end(i) * 1000 + videoBuffered.start(i) * 1000;
                    }

                    checkReady($videoElement[0].duration * 1000, buffered);
                },

                periodicCheck = () => {
                    periodicCheckPromise = $timeout(periodicCheck, 500, false);
                    progressHandler();
                    checkReady($videoElement[0].duration * 1000, buffered);
                },

                setVideoElement = () => {
                    if ($videoElement.length <= 0) {
                        console.warn('Directive ' + directiveName +
                            ' should wrap a video element');

                        return;
                    }
                    $videoElement.on('error', readyDeferred.reject);
                    $videoElement.on('loadedmetadata', checkReady.bind(null,
                        $videoElement[0].duration * 1000, buffered));
                    $videoElement.on('progress', function() {
                        console.log('progress');
                        progressHandler();
                    });
                    $videoElement.on('ended', function() {
                        resolve();
                    });

                    $videoElement[0].preload = 'auto';
                    $videoElement[0].load();
                    periodicCheck();
                },

                setUp = () => {
                    setStatus('READY');
                    $videoElement[0].pause();
                    $videoElement[0].currentTime = 0;
                },

                clear = () => {
                    let clearDeferred = $q.defer();
                    clearDeferred.resolve();

                    if (status === 'RUNNING') {
                        //TODO we might want to reject this to handle this
                        //usecase, needs more cowbell
                        resolve();
                    }
                    setUp();

                    return clearDeferred.promise;
                },

                runAnimation = () => {
                    setStatus('RUNNING');
                    ready().then(function() {
                        console.log('play');
                        $videoElement[0].play();
                    });
                },
                play = () => {
                    if (status === 'READY') {
                        deferred = $q.defer();
                        runAnimation();
                    }
                    return deferred.promise;
                };

            //APIs used by linking function
            this.setUp = setUp;
            this.setVideoElement = setVideoElement;
            this.runAnimation = runAnimation;

            //Public APIs
            this.play = play;
            this.clear = clear;

            //@TODO: ready might eventually be part of the animation api interface.
            this.ready = ready;

        },
        link(scope, element, attrs, controllers) {
            const selfController = controllers[0],
                routerController = controllers[1],
                animationName = attrs.paAnimationName || directiveName;

            if (routerController) {
                routerController.register(animationName, selfController);
            }
            selfController.setVideoElement();
            selfController.setUp();
            if (attrs.paActive) {
                scope.$watch(attrs.paActive, (newVal) => {
                    if (newVal) {
                        selfController.runAnimation();
                    } else if (attrs.paUndo) {
                        selfController.setUp();
                    }
                });
            }

        }
    };
});

export default mod;
