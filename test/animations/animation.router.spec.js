describe('pa-router directive', () => {
    let scope = {},
        template = `
            <div    pa-router
                    pa-active="visible"
                    pa-status="status"
                    pa-animation-name="animation-name"
                ></div>
            </div>
            `,
        compile,
        animate,
        routerController = {
            register() {
                return;
            }
        },
        timeout;
    beforeEach(angular.mock.module('pa.animations.router'));
    beforeEach(angular.mock.module('ngAnimateMock'));

    beforeEach(angular.mock.inject(($compile, $rootScope, $timeout, $animate) => {
        scope = $rootScope.$new();
        animate = $animate;
        scope.visible = false;
        compile = () => {
            let element = angular.element(template);
            $compile(element)(scope);
            return element.controller('paRouter');
        };

        timeout =  $timeout;
    }));

    it('should set the status to READY', () => {
        compile();
        scope.status.should.equal('READY');
    });


    describe('active watch', () => {
        it('should trigger all registered animations', angular.mock.inject(($q) => {
            let controller = compile(),
                deferred = $q.defer(),
                mockAnimation = {
                    play: () => deferred.promise
                };

            sinon.spy(mockAnimation, 'play');
            controller.register('a-name', mockAnimation);
            mockAnimation.play.should.not.have.been.called;
            scope.visible = true;
            scope.$apply();
            mockAnimation.play.should.have.been.calledOnce;
        }));

        it('should should set status correctly', angular.mock.inject(($q) => {
            let controller = compile(),
                deferred = $q.defer(),
                mockAnimation = {
                    play: () => deferred.promise
                };

            controller.register('a-name', mockAnimation);
            scope.status.should.equal('READY');

            scope.visible = true;
            scope.$apply();
            scope.status.should.equal('RUNNING');


            deferred.resolve();
            scope.$apply();
            scope.status.should.equal('FINISHED');

        }));
    });

    describe('controller', () => {
        it('should be defined', () => {
            let controller = compile();
            controller.should.be.defined;
        });

        describe('#register', () => {
            it('should store the elments',  angular.mock.inject(($q) => {
                let controller = compile(),
                    deferred1 = $q.defer(),
                    deferred2 = $q.defer(),
                    mockAnimation1 = {
                        play: () => deferred1.promise
                    },
                    mockAnimation2 = {
                        play: () => deferred2.promise
                    };

                sinon.spy(mockAnimation1, 'play');
                sinon.spy(mockAnimation2, 'play');
                mockAnimation1.play.should.not.have.been.called;
                mockAnimation2.play.should.not.have.been.called;
                controller.register('a-name', mockAnimation1);
                controller.register('a-name-2', mockAnimation2);
                scope.visible = true;
                scope.$apply();
                mockAnimation1.play.should.have.been.calledOnce;
                deferred1.resolve();
                scope.$apply();
                mockAnimation2.play.should.have.been.calledOnce;
            }));

            it('should store the elments with the specified order if any',  angular.mock.inject(($q) => {
                let controller = compile(),
                    deferred1 = $q.defer(),
                    deferred2 = $q.defer(),
                    mockAnimation1 = {
                        play: () => deferred1.promise
                    },
                    mockAnimation2 = {
                        play: () => deferred2.promise
                    };

                sinon.spy(mockAnimation1, 'play');
                sinon.spy(mockAnimation2, 'play');
                mockAnimation1.play.should.not.have.been.called;
                mockAnimation2.play.should.not.have.been.called;
                controller.register('a-name', mockAnimation1, 2);
                controller.register('a-name-2', mockAnimation2, 1);
                scope.visible = true;
                scope.$apply();
                mockAnimation2.play.should.have.been.calledOnce;
                mockAnimation1.play.should.not.have.been.called;
                deferred2.resolve();
                scope.$apply();
                mockAnimation1.play.should.have.been.calledOnce;
            }));
        });

        describe('#play', () => {
            it('should store the elments',  angular.mock.inject(($q) => {
                let controller = compile(),
                    deferred1 = $q.defer(),
                    deferred2 = $q.defer(),
                    mockAnimation1 = {
                        play: () => deferred1.promise
                    },
                    mockAnimation2 = {
                        play: () => deferred2.promise
                    };

                sinon.spy(mockAnimation1, 'play');
                sinon.spy(mockAnimation2, 'play');
                mockAnimation1.play.should.not.have.been.called;
                mockAnimation2.play.should.not.have.been.called;
                controller.register('a-name', mockAnimation1);
                controller.register('a-name-2', mockAnimation2);
                controller.play();
                scope.$apply();
                mockAnimation1.play.should.have.been.calledOnce;
                deferred1.resolve();
                scope.$apply();
                mockAnimation2.play.should.have.been.calledOnce;
            }));

            it('should store the elments with the specified order if any',  angular.mock.inject(($q) => {
                let controller = compile(),
                    deferred1 = $q.defer(),
                    deferred2 = $q.defer(),
                    mockAnimation1 = {
                        play: () => deferred1.promise
                    },
                    mockAnimation2 = {
                        play: () => deferred2.promise
                    };

                sinon.spy(mockAnimation1, 'play');
                sinon.spy(mockAnimation2, 'play');
                mockAnimation1.play.should.not.have.been.called;
                mockAnimation2.play.should.not.have.been.called;
                controller.register('a-name', mockAnimation1, 2);
                controller.register('a-name-2', mockAnimation2, 1);
                controller.play();
                scope.$apply();
                mockAnimation2.play.should.have.been.calledOnce;
                mockAnimation1.play.should.not.have.been.called;
                deferred2.resolve();
                scope.$apply();
                mockAnimation1.play.should.have.been.calledOnce;
            }));

            it('should return a promise resolved when all animation have finished',  angular.mock.inject(($q) => {
                let controller = compile(),
                    deferred1 = $q.defer(),
                    deferred2 = $q.defer(),
                    mockAnimation1 = {
                        play: () => deferred1.promise
                    },
                    mockAnimation2 = {
                        play: () => deferred2.promise
                    },
                    playPromise,
                    spy = sinon.spy();

                controller.register('a-name', mockAnimation1);
                controller.register('a-name-2', mockAnimation2);
                playPromise = controller.play();
                playPromise.then(spy);
                scope.$apply();

                spy.should.not.have.been.called;

                deferred1.resolve();
                scope.$apply();
                spy.should.not.have.been.called;

                deferred2.resolve();
                scope.$apply();
                spy.should.have.been.calledOnce;

            }));

            it('should set status correctly',  angular.mock.inject(($q) => {
                let controller = compile(),
                    deferred1 = $q.defer(),
                    deferred2 = $q.defer(),
                    mockAnimation1 = {
                        play: () => deferred1.promise
                    },
                    mockAnimation2 = {
                        play: () => deferred2.promise
                    };

                controller.register('a-name', mockAnimation1);
                controller.register('a-name-2', mockAnimation2);

                scope.status.should.equal('READY');
                controller.play();

                scope.$apply();
                scope.status.should.equal('RUNNING');


                deferred1.resolve();
                scope.$apply();
                scope.status.should.equal('RUNNING');

                deferred2.resolve();
                scope.$apply();
                scope.status.should.equal('FINISHED');


            }));
        });
    });
});
