describe('cat-timeline directive', () => {
    let scope = {},
        $animate,
        $compile,
        $rootScope,
        template = `
            <div>
                <div    cat-timeline
                        cat-active="visible"
                        cat-status="status"
                        cat-animation-name="animation-name"
                    ></div>
                </div>
            </div>
            `,
        compile,
        catAnimationLink,
        catBaseAnimation,
        element,
        sandbox,
        timelineController = {
            register () {
                return;
            }
        },
        $timeout;

    beforeEach(function() {
        sandbox = sinon.sandbox.create();
    });

    beforeEach(angular.mock.module('cat.animations.baseAnimation', function($provide) {
        $provide.decorator('catBaseAnimation', function($delegate) {
                return sandbox.spy($delegate);
        });
    }));

    beforeEach(angular.mock.module('cat.animations.animationLink', function($provide) {
        $provide.decorator('catAnimationLink', function($delegate) {
                return sandbox.spy($delegate);
        });
    }));

    beforeEach(angular.mock.module('cat.animations.timeline'));
    beforeEach(angular.mock.module('ngAnimateMock'));

    beforeEach(angular.mock.inject((_$compile_, _$rootScope_, _$timeout_, _$animate_, _catAnimationLink_, _catBaseAnimation_) => {
        $rootScope = _$rootScope_;
        $animate = _$animate_;
        $compile = _$compile_;
        scope = $rootScope.$new();
        catAnimationLink =  _catAnimationLink_;
        catBaseAnimation =  _catBaseAnimation_;

        scope.visible = false;

        compile = () => {
            let parentElement = angular.element(template);
            parentElement.data('$catTimelineController', timelineController);
            $compile(parentElement)(scope);
            element = parentElement.children();
            return element.controller('catTimeline');
        };

        $timeout =  _$timeout_;
    }));


    afterEach(() => {
        sandbox.restore();
    });

    it('should register itself on the catTimeline parent controller', () => {
        sandbox.spy(timelineController, 'register');
        compile();
        timelineController.register.should.have.been.calledOnce;
        timelineController.register.should.have.been.calledWith('animation-name', element.controller('catTimeline'));
    });

    it('should register itself on the catTimeline parent controller regardless of the nesting level', () => {
        sandbox.spy(timelineController, 'register');
        let template = `
            <div>
                <div>
                    <div
                        cat-Timeline
                        cat-animation-name="animation-name"

                    ></div>
                </div>
            </div>`,
            parentElement = angular.element(template);

        parentElement.data('$catTimelineController', timelineController);
        $compile(parentElement)($rootScope.$new());
        element = parentElement.children().children();
        timelineController.register.should.have.been.calledOnce;
        timelineController.register.should.have.been.calledWith('animation-name', element.controller('catTimeline'));
    });

    describe('#Linking Function', () => {
        it('Should call catAnimationLink function', () => {
            compile();
            catAnimationLink.should.have.been.calledOnce;
        });
    });

    describe('#Controller', () => {
        let $q,
            controller,
            deferred1,
            deferred2,
            mockAnimation1,
            mockAnimation2;

        beforeEach(() => {
            controller = compile();
            scope.$apply();
        });

        beforeEach(angular.mock.inject((_$q_) => {
            $q = _$q_;
            deferred1 = $q.defer();
            deferred2 = $q.defer();
            mockAnimation1 = {
                play: sandbox.spy(() => deferred1.promise),
                setDisabled: sandbox.spy(),
                seek: sandbox.spy()
            };
            mockAnimation2 = {
                play: sandbox.spy(() => deferred2.promise),
                setDisabled: sandbox.spy(),
                seek: sandbox.spy()
            };
        }));

        it('should be defined', () => {
            controller.should.be.defined;
        });

        it('Should use catBaseAnimation', () => {
            catBaseAnimation.should.have.been.calledOnce;
        });

        it('Should pass scope catBaseAnimation', () => {
            var config;
            config = catBaseAnimation.args[0][0];
            config.$scope.should.equal(scope);
        });

        it('Should pass catBaseAnimation a config with defined onPlay, onSetUp, onClear, disable and attrs', () => {
            var config;
            var apiFunctions = ['onSeek', 'onPlay', 'disable'];
            config = catBaseAnimation.args[0][0];
            config.$attrs.should.be.defined;
            apiFunctions.forEach(function(api) {
                config[api].should.be.function;
                config[api].should.not.be.equal(angular.noop);

            });
        });

        describe('#Timeline specific APIs', () => {
            describe('#getAllAnimations', () => {
                it('should be defined.', () => {
                    controller.getAllAnimations.should.be.a('function');
                });

                it('should return an empty object if no animations are registered.', () => {
                    controller.getAllAnimations().should.be.empty;
                });

                it('should return the map with all the registerd animations.', () => {
                    let map;
                    controller.register('a-name', mockAnimation1);
                    controller.register('a-name-2', mockAnimation2);
                    map =  controller.getAllAnimations();
                    map['a-name'].should.be.equal(mockAnimation1);
                    map['a-name-2'].should.be.equal(mockAnimation2);
                });
            });

            describe('#getAnimation', () => {
                it('should be defined.', () => {
                    controller.getAnimation.should.be.a('function');
                });

                it('should return a false object if requested animation has not been registered.', () => {
                    let animation = controller.getAnimation('foo');
                    should.equal(animation, undefined);
                });

                it('should return the registered animation.', () => {
                    let aName;
                    controller.register('a-name', mockAnimation1);
                    controller.register('a-name-2', mockAnimation2);
                    aName =  controller.getAnimation('a-name');
                    aName.should.be.equal(mockAnimation1);
                });
            });

            describe('#register', () => {
                it('should store the elments',  () => {
                    let aName, aName2;
                    controller.register('a-name', mockAnimation1);
                    controller.register('a-name-2', mockAnimation2);
                    aName =  controller.getAnimation('a-name');
                    aName2 = controller.getAnimation('a-name-2');
                    aName.should.be.equal(mockAnimation1);
                    aName2.should.be.equal(mockAnimation2);
                });

                it('should store the elments',  () => {
                    //TODO: we can probably remove this one, since
                    // is redundant with play tests.
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
                });

                it('should store the elments with the specified order if any', () => {

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
                });

                it('should set the disable status correctly', () => {
                    controller.setDisabled(true);
                    scope.$apply();
                    controller.register('a-name', mockAnimation1);
                    mockAnimation1.setDisabled.should.have.been.calledWith(true);
                });

                it('should seek the end if status in not ready', () => {
                    controller.play();
                    scope.$apply();
                    controller.register('a-name', mockAnimation1);
                    mockAnimation1.seek.should.have.been.calledWith('end');
                });
            });

            describe('#setCustomAnimation', () => {
                it('should be defined', () => {
                    controller.setCustomAnimation.should.be.defined;
                });

                it('should override the default animation', () => {
                    let deferred = $q.defer(),
                        customAnimation = sinon.spy(() => {
                            return deferred.promise;
                        });
                    controller.setCustomAnimation(customAnimation);
                    customAnimation.should.not.have.been.called;
                    controller.play();
                    scope.$apply();
                    customAnimation.should.have.been.calledOnce;
                });

                it('should wait on the custom animation promise', () => {
                    let deferred = $q.defer(),
                        customAnimation = sinon.spy(() => {
                            return deferred.promise;
                        }),
                        afterPlay = sinon.spy();
                    controller.setCustomAnimation(customAnimation);
                    controller.play().then(afterPlay);
                    scope.$apply();
                    afterPlay.should.not.have.been.called;
                    deferred.resolve();
                    scope.$apply();
                    afterPlay.should.have.been.called;
                });
            });
        });

        describe('#Animation specific APIs', () => {
            describe('#setUp', () => {
                it('should be defined. Plain baseAnimation setup.', () => {
                    controller.setUp.should.be.a('function');
                });
            });

            describe('#play', () => {
                it('should be defined.', () => {
                    controller.play.should.be.a('function');
                });

                it('should run the animations sequence', () => {
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
                });

                it('should run the animations sequence in the provided custom order', () => {
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
                });
            });

            describe('#seek', () => {
                it('should be defined.', () => {
                    controller.seek.should.be.a('function');
                });

                it('should call seek on all registered directives with provided target.', () => {
                    controller.register('a-name', mockAnimation1);
                    controller.register('a-name-2', mockAnimation2);
                    controller.seek('end');
                    scope.$apply();
                    mockAnimation1.seek.should.have.been.calledOnce;
                    mockAnimation2.seek.should.have.been.calledOnce;
                    mockAnimation1.seek.should.have.been.calledWith('end');
                    mockAnimation2.seek.should.have.been.calledWith('end');
                });
            });

            describe('#setDisabled', () => {
                it('should be defined.', () => {
                    controller.setDisabled.should.be.a('function');
                });

                it('should set the disable status correctly', () => {
                    controller.setDisabled(true);
                    scope.$apply();
                    controller.register('a-name', mockAnimation1);
                    mockAnimation1.setDisabled.should.have.been.calledWith(true);
                });

                it('should call disable on all registered directives with provided value.', () => {
                    controller.register('a-name', mockAnimation1);
                    controller.register('a-name-2', mockAnimation2);
                    controller.setDisabled(false);
                    $rootScope.$apply();
                    mockAnimation1.setDisabled.secondCall.should.have.been.calledWith(false);
                    mockAnimation2.setDisabled.secondCall.should.have.been.calledWith(false);
                });
            });
        });
    });
});
