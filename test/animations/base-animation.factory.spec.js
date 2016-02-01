describe('catBaseAnimation', () => {
    let sandbox,
        catBaseAnimation,
        scope,
        $rootScope,
        $q,
        seekDefer,
        playDefer,
        config,
        base;

    beforeEach(function() {
        sandbox = sinon.sandbox.create();
    });

    beforeEach(angular.mock.module('cat.animations.timeline'));
    beforeEach(angular.mock.module('cat.animations.delay'));
    beforeEach(angular.mock.module('cat.animations.baseAnimation'));
    beforeEach(angular.mock.module('cat.animations.animationLink'));
    beforeEach(angular.mock.module('ngAnimateMock'));

    beforeEach(function() {
        sandbox = sinon.sandbox.create();
    });

    beforeEach(angular.mock.inject((_$rootScope_, _catBaseAnimation_, _$q_) => {
        $rootScope = _$rootScope_;
        scope = $rootScope.$new();
        catBaseAnimation =  _catBaseAnimation_;
        $q =  _$q_;
    }));

    //Mock controllers.
    beforeEach(function() {

        seekDefer = $q.defer();
        playDefer = $q.defer();
        config = {
            onSeek: sandbox.spy(() => {
                return seekDefer.promise;
            }),
            onPlay: sandbox.spy(() => {
                return playDefer.promise;
            }),
            disable: sandbox.spy()
        };
        base = catBaseAnimation(config);
    });

    it('should be defined', () => {
        catBaseAnimation.should.be.defined;
        catBaseAnimation.should.be.a.function;
    });

    it('should return an object with the animation interface functions defined', () => {
        let apis = ['play', 'seek', 'setDisabled', 'setUp'],
            base = catBaseAnimation({});

        apis.forEach((api) => {
            base[api].should.be.a('function');
        });
    });

    it('should return an obj with status and isDisabled properties', function() {
        let base = catBaseAnimation({});
        base.should.have.property('status');
        base.should.have.property('isDisabled');
    });

    describe('#Play', () => {
        it('should be defined', () => {
            base.play.should.be.a('function');
        });

        it('should wait for the setup', () => {
            base.play();
            config.onPlay.should.not.have.been.called;
            base.setUp();
            scope.$apply();
            config.onPlay.should.have.been.called;
        });

        it('should return a promise', () => {
            let cb = sandbox.spy();
            base.setUp();
            base.play().then(cb);
            playDefer.resolve();
            scope.$apply();
            cb.should.have.been.calledOnce;
        });

        it('should call the onPlay config function', () => {
            base.setUp();
            base.play();
            scope.$apply();
            config.onPlay.should.have.been.calledOnce;
        });

        it('should not call the onPlay config function if disabled, it should seek the end', () => {
            base.setDisabled(true);
            scope.$apply();
            base.setUp();
            scope.$apply();
            base.play();
            scope.$apply();
            base.status.should.equal('SEEKING');
            seekDefer.resolve();
            scope.$apply();
            base.status.should.equal('FINISHED');
            config.onPlay.should.not.have.been.called;
        });

        it('should not call the onPlay config function if already in a state different from READY', () => {
            base.setUp();
            base.play();
            scope.$apply();
            config.onPlay.should.have.been.called;
            base.play();
            config.onPlay.should.have.not.been.calledTwice;
            playDefer.resolve();
            scope.$apply();
            config.onPlay.should.have.not.been.calledTwice;
        });

        it('should set the status to running and then to finish', () => {
            base.setUp();
            base.play();
            scope.$apply();
            base.status.should.equal('RUNNING');
            playDefer.resolve();
            scope.$apply();
            base.status.should.equal('FINISHED');
        });

        it('should reject the promise if the onPlay throws an error', () => {
            let failCb = sandbox.spy(),
                successCb = sandbox.spy();
            base.setUp();
            base.play().then(successCb, failCb);
            playDefer.reject();
            scope.$apply();
            failCb.should.have.been.calledOnce;
            successCb.should.not.have.been.called;
        });


    });

    describe('#Seek', () => {
        it('should be defined', () => {
            base.seek.should.be.a('function');
        });

        it('should wait for the setup', () => {
            base.seek();
            config.onSeek.should.not.have.been.called;
            base.setUp();
            scope.$apply();
            config.onSeek.should.have.been.called;
        });

        it('should return a promise', () => {
            let cb = sandbox.spy();
            base.setUp();
            base.seek().then(cb);
            seekDefer.resolve();
            scope.$apply();
            cb.should.have.been.calledOnce;
        });

        it('should reject the play defered if seek is called when the animation is runnung', () => {
            let cb = sandbox.spy();
            base.setUp();
            base.play(). catch(cb);
            scope.$apply();
            base.seek('end');
            scope.$apply();
            cb.should.have.been.calledOnce;
        });

        it('should set the status to seeking and then to according state', () => {
            base.setUp();
            scope.$apply();
            base.seek('end');
            scope.$apply();
            base.status.should.equal('SEEKING');
            seekDefer.resolve();
            scope.$apply();
            base.status.should.equal('FINISHED');
            base.seek('start');
            seekDefer.resolve();
            scope.$apply();
            base.status.should.equal('READY');
        });
    });

    describe('#setDisabled', () => {
        it('should be defined', () => {
            base.setDisabled.should.be.a('function');
        });

        it('should wait for the setup', () => {
            base.setDisabled(true);
            config.disable.should.not.have.been.called;
            base.setUp();
            scope.$apply();
            config.disable.should.have.been.called;
        });

        it('should return a promise', () => {
            let cb = sandbox.spy();
            base.setUp();
            base.setDisabled(true).then(cb);
            scope.$apply();
            cb.should.have.been.calledOnce;
        });

        it('should seek the end if animation is already finished', () => {
            base.setUp();
            scope.$apply();
            base.play();
            playDefer.resolve();
            scope.$apply();
            base.setDisabled(true);
            seekDefer.resolve();
            scope.$apply();
            base.status.should.equal('FINISHED');
        });

        it('should seek the end if animation is already running', () => {
            base.setUp();
            scope.$apply();
            base.play();
            base.setDisabled(true);
            seekDefer.resolve();
            scope.$apply();
            base.status.should.equal('FINISHED');
        });

        it('should seek the start if animation is in a READY state', () => {
            base.setUp();
            scope.$apply();
            base.setDisabled(true);
            seekDefer.resolve();
            scope.$apply();
            base.status.should.equal('READY');
        });
    });

    describe('#setUp', () => {
        let setupDefer, base;
        beforeEach(() => {
            setupDefer = $q.defer();
            config = {
                onSeek: sandbox.spy(() => {
                    return seekDefer.promise;
                }),
                onPlay: sandbox.spy(() => {
                    return playDefer.promise;
                }),
                disable: sandbox.spy(),
                onSetUp: sandbox.spy(() => {
                    return setupDefer.promise;
                })
            };
            base = catBaseAnimation(config);
        });

        it('should be defined', () => {
            base.setUp.should.be.a('function');
        });

        it('should return a promise', () => {
            let cb = sandbox.spy();
            base.setUp().then(cb);
            setupDefer.resolve();
            scope.$apply();
            cb.should.have.been.calledOnce;
        });

        it('should set the status to ready', () => {
            base.setUp();
            setupDefer.resolve();
            scope.$apply();
            base.status.should.equal('READY');
        });

        it('should reject the promise if the onSetup throws an error', () => {
            let failCb = sandbox.spy(),
                successCb = sandbox.spy();
            base.setUp().then(successCb, failCb);
            setupDefer.reject();
            scope.$apply();
            failCb.should.have.been.calledOnce;
            successCb.should.not.have.been.called;
        });
    });

});
