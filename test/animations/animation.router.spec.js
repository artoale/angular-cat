describe('pa-router directive', () => {
    let scope = {},
        template = `
            <div>
                <div    pa-router
                        pa-active="visible"
                        pa-status="status"
                        pa-animation-name="animation-name"
                    ></div>
                </div>
            </div>
            `,
        compile,
        animate,
        element,
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
            let parentElement = angular.element(template);
            parentElement.data('$paRouterController', routerController);
            $compile(parentElement)(scope);
            element = parentElement.children();
            return element.controller('paRouter');
        };

        timeout =  $timeout;
    }));

    it('should set the status to READY', () => {
        compile();
        scope.status.should.equal('READY');
    });

    it('should register itself on the paRouter parent controller', () => {
        sinon.spy(routerController, 'register');
        let controller = compile();

        routerController.register.should.have.been.calledOnce;
        routerController.register.should.have.been.calledWith('animation-name', controller);
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

        it('should clear animations if undo is set', angular.mock.inject(($q) => {

            let oldTemplate = template,
                controller,
                deferred = $q.defer(),
                deferred2 = $q.defer(),
                mockAnimation = {
                    play: () => deferred.promise,
                    clear: () => {
                        return deferred2.promise;
                    }
                };

            template = `
               <div>
                   <div    pa-router
                           pa-active="visible"
                           pa-status="status"
                           pa-animation-name="animation-name"
                           pa-undo="1"
                       ></div>
                   </div>
               </div>
               `;
            controller = compile();

            controller.register('a-name', mockAnimation);
            sinon.spy(mockAnimation, 'clear');

            scope.visible = true;
            scope.$apply();

            deferred.resolve();
            scope.$apply();

            mockAnimation.clear.should.not.have.been.called;

            scope.visible = false;
            scope.$apply();

            mockAnimation.clear.should.have.been.calledOnce;
            template = oldTemplate;
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
        describe('#clear', () => {
            it('Should clear all registered animations',  angular.mock.inject(($q) => {
                let controller = compile(),
                    deferred1 = $q.defer(),
                    deferred2 = $q.defer(),
                    mockAnimation1 = {
                        clear: () => deferred1.promise
                    },
                    mockAnimation2 = {
                        clear: () => deferred2.promise
                    };

                sinon.spy(mockAnimation1, 'clear');
                sinon.spy(mockAnimation2, 'clear');
                mockAnimation1.clear.should.not.have.been.called;
                mockAnimation2.clear.should.not.have.been.called;
                controller.register('a-name', mockAnimation1);
                controller.register('a-name-2', mockAnimation2);
                controller.clear();
                mockAnimation1.clear.should.have.been.calledOnce;
                mockAnimation2.clear.should.have.been.calledOnce;
            }));

            it('Should set the status correctly',  angular.mock.inject(($q) => {
                let controller = compile(),
                    deferred1 = $q.defer(),
                    deferred2 = $q.defer(),
                    mockAnimation1 = {
                        clear: () => deferred1.promise
                    },
                    mockAnimation2 = {
                        clear: () => deferred2.promise
                    };

                sinon.spy(mockAnimation1, 'clear');
                sinon.spy(mockAnimation2, 'clear');

                controller.play();
                scope.$apply();
                scope.status.should.equal('FINISHED');

                controller.register('a-name', mockAnimation1);
                controller.register('a-name-2', mockAnimation2);

                controller.clear();
                deferred1.resolve();
                deferred2.resolve();
                scope.$apply();
                scope.status.should.equal('READY');
            }));


            it('should resolve the play promise',  angular.mock.inject(($q) => {
                let controller = compile(),
                    deferred1 = $q.defer(),
                    deferred2 = $q.defer(),
                    mockAnimation1 = {
                        clear: () => deferred1.promise,
                        play: () => deferred2.promise
                    },
                    playPromise,
                    promiseSpy = sinon.spy();


                controller.register('a-name', mockAnimation1);

                playPromise = controller.play();
                playPromise.then(promiseSpy);

                scope.$apply();

                // (since deferred 1 not fulfilled yet)
                promiseSpy.should.not.have.been.called;


                controller.clear();
                scope.$apply();
                deferred1.resolve();
                promiseSpy.should.have.been.called;

            }));

        });

    });
});
