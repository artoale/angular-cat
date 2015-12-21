describe('cat-delay directive', () => {
    let element,
        scope = {},
        catAnimationLink,
        catBaseAnimation,
        catDelayS,
        sandbox,
        template = `
            <div>
                <div
                    cat-delay="300"
                    cat-active="visible"
                    cat-status="status"
                    cat-animation-name="animation-name"
                ></div>
            </div>
            `,
        compile,
        timelineController = {
            register() {
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

    beforeEach(angular.mock.module('cat.utils.delay', function($provide) {
        $provide.decorator('catDelayS', function($delegate) {
                return sandbox.spy($delegate);
        });
    }));

    beforeEach(angular.mock.module('cat.animations.delay'));
    beforeEach(angular.mock.module('ngAnimateMock'));

    beforeEach(angular.mock.inject(($compile, $rootScope, _$timeout_, _catAnimationLink_, _catBaseAnimation_, _catDelayS_) => {
        scope = $rootScope.$new();
        catAnimationLink =  _catAnimationLink_;
        catBaseAnimation =  _catBaseAnimation_;
        catDelayS = _catDelayS_;
        scope.visible = false;
        compile = () => {
            let parentElement = angular.element(template);
            parentElement.data('$catTimelineController', timelineController);
            $compile(parentElement)(scope);
            element = parentElement.children();
            scope.$apply();
        };

        $timeout = _$timeout_;
    }));

    afterEach(() => {
        sandbox.restore();
    });

    it('should set the status to READY if variable is binded', () => {
        compile();
        scope.status.should.equal('READY');
    });

    it('should register itself on the catTimeline parent controller', () => {
        sinon.spy(timelineController, 'register');
        compile();
        timelineController.register.should.have.been.calledOnce;
        timelineController.register.should.have.been.calledWith('animation-name', element.controller('catDelay'));
    });

    describe('#Linking Function', () => {
        it('Should call catAnimationLink function', () => {
            compile();
            catAnimationLink.should.have.been.calledOnce;
        });
    });

    describe('controller', () => {
        let controller;

        beforeEach(() => {
            compile();
            controller = element.controller('catDelay');
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
            var apiFunctions = ['onSetUp'];
            config = catBaseAnimation.args[0][0];
            config.$attrs.should.be.defined;
            apiFunctions.forEach(function(api) {
                config[api].should.be.function;
                config[api].should.not.be.equal(angular.noop);

            });
        });

        describe('#play', () => {
            it('should be defined', () => {
                controller.play.should.be.a('function');
            });

            it('should return a promise', () => {
                controller.play().then.should.be.defined;
            });

            it('should call catDelayS with the specified delay', () => {
                controller.play();
                scope.$apply();
                catDelayS.should.have.been.calledWith(300);
            });

            it('should resolve the animation promise after the specified delay', () => {
                let spy = sandbox.spy();
                controller.play().then(spy);
                scope.$apply();
                spy.should.not.have.been.called;
                $timeout.flush(300);
                spy.should.have.been.calledOnce;
            });

            it('should update status correctly', () => {
                scope.status.should.equal('READY');

                controller.play();
                scope.$apply();

                scope.status.should.equal('RUNNING');
                $timeout.flush(300);
                scope.status.should.equal('FINISHED');
            });
        });
    });
});
