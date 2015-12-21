describe('cat-class directive', () => {
    let element,
        scope = {},
        $compile,
        $rootScope,
        $timeout,
        catAnimationLink,
        catBaseAnimation,
        $animate,
        template = `
            <div>
                <div
                    cat-class="a-class-name"
                    cat-active="visible"
                    cat-status="status"
                    cat-animation-name="animation-name"

                ></div>
            </div>
            `,
        compile,
        timelineController = {
            register () {
                return;
            }
        },
        sandbox,
        timeout;

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

    beforeEach(angular.mock.module('cat.animations.class'));
    beforeEach(angular.mock.module('ngAnimateMock'));

    beforeEach(angular.mock.inject(
            (_$compile_, _$rootScope_, _$timeout_, _$animate_, _catAnimationLink_, _catBaseAnimation_) => {
        scope = _$rootScope_.$new();
        $compile = _$compile_;
        catAnimationLink =  _catAnimationLink_;
        catBaseAnimation =  _catBaseAnimation_;
        $rootScope = _$rootScope_;
        $timeout = _$timeout_;
        $animate = _$animate_;
        scope.visible = false;
        compile = () => {
            let parentElement = angular.element(template);
            parentElement.data('$catTimelineController', timelineController);
            $compile(parentElement)(scope);
            element = parentElement.children();
        };

        timeout =  $timeout;
    }));

    afterEach(() => {
        sandbox.restore();
    });

    it('should register itself on the catTimeline parent controller', () => {
        sandbox.spy(timelineController, 'register');
        compile();
        timelineController.register.should.have.been.calledOnce;
        timelineController.register.should.have.been.calledWith('animation-name', element.controller('catClass'));
    });

    it('should register itself on the catTimeline parent controller regardless of the nesting level', () => {
        sandbox.spy(timelineController, 'register');
        let template = `
            <div>
                <div>
                    <div
                        cat-class="a-class-name"
                        cat-active="visible"
                        cat-status="status"
                        cat-animation-name="animation-name"

                    ></div>
                </div>
            </div>`,
            parentElement = angular.element(template);

        parentElement.data('$catTimelineController', timelineController);
        $compile(parentElement)($rootScope.$new());
        element = parentElement.children().children();
        timelineController.register.should.have.been.calledOnce;
        timelineController.register.should.have.been.calledWith('animation-name', element.controller('catClass'));
    });

    describe('#Linking Function', () => {
        it('Should call catAnimationLink function', () => {
            compile();
            catAnimationLink.should.have.been.calledOnce;
        });
    });

    describe('#Controller', () => {
        let controller;

        beforeEach(() => {
            compile();
            scope.$apply();
            controller = element.controller('catClass');
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
            var apiFunctions = ['onSeek', 'onPlay', 'onSetUp', 'disable'];
            config = catBaseAnimation.args[0][0];
            config.$attrs.should.be.defined;
            apiFunctions.forEach(function(api) {
                config[api].should.be.function;
                config[api].should.not.be.equal(angular.noop);

            });
        });

        describe('#setUp', () => {
            it('should be defined', () => {
                controller.setUp.should.be.a('function');
            });

            it('Should call catAnimationLink function', () => {
                element.hasClass('a-class-name--start').should.be.true;
            });
        });

        describe('#play', () => {
            it('should be defined', () => {
                controller.play.should.be.a('function');
            });

            it('Should call catAnimationLink function', () => {
                element.hasClass('a-class-name--start').should.be.true;
                controller.play();
                scope.$apply();
                element.hasClass('a-class-name--start').should.be.false;
            });
        });

        describe('#seek', () => {
            //TODO: we should probably test the transition none and the forced reflow as well.
            it('should be defined', () => {
                controller.seek.should.be.a('function');
            });

            it('Should add start class if called with "start"', () => {
                controller.seek('start');
                $rootScope.$apply();
                element.hasClass('a-class-name--start').should.be.true;
            });

            it('Should remove start class if called with "end"', () => {
                controller.seek('end');
                $rootScope.$apply();
                element.hasClass('a-class-name--start').should.be.false;
            });
        });
    });
});
