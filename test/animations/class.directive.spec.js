describe('cat-class directive', () => {
    let element,
        scope = {},
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
        animate,
        timelineController = {
            register () {
                return;
            }
        },
        sandbox,
        timeout;
    beforeEach(angular.mock.module('cat.animations.animationLink'));
    beforeEach(angular.mock.module('cat.animations.class'));
    beforeEach(angular.mock.module('ngAnimateMock'));

    beforeEach(angular.mock.inject(($compile, $rootScope, $timeout, $animate) => {
        scope = $rootScope.$new();
        sandbox = sinon.sandbox.create();
        animate = $animate;
        scope.visible = true;
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

    it('should add a class with --start suffix', () => {
        compile();
        element.hasClass('a-class-name--start').should.be.true;
    });

    it('should add the base class if not already specified', () => {
        compile();
        element.hasClass('a-class-name').should.be.true;
    });

    it('should set the status to READY if variable is binded', () => {
        compile();
        scope.status.should.equal('READY');
    });

    it('should register itself on the catTimeline parent controller', () => {
        sandbox.spy(timelineController, 'register');
        compile();
        timelineController.register.should.have.been.calledOnce;
        timelineController.register.should.have.been.calledWith('animation-name', element.controller('catClass'));
    });

    it('should register itself on the catTimeline parent controller regardless of the nesting level', angular.mock.inject(($compile, $rootScope) => {
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
    }));

    describe('active watch', () => {
        it('should remove the prefixed class', () => {
            compile();
            scope.visible = true;
            scope.$apply();
            element.hasClass('a-class-name--start').should.be.false;
            animate.flush();
        });

        it('should set the status to "RUNNING", then to "FINISHED"', () => {
            compile();
            scope.visible = true;
            scope.$apply();
            scope.status.should.equal('RUNNING');

            animate.flush();
            scope.status.should.equal('FINISHED');
        });
    });

    describe('controller', () => {
        let controller;

        beforeEach(() => {
            compile();
            controller = element.controller('catClass');
        });

        describe('#play', () => {
            it('should be defined', () => {
                controller.play.should.be.a('function');
            });

            it('should remove the prefixed class', () => {
                element.hasClass('a-class-name--start').should.be.true;

                controller.play();
                scope.$apply();

                element.hasClass('a-class-name--start').should.be.false;
            });

            it('should update status correctly', () => {
                scope.status.should.equal('READY');

                controller.play();
                scope.status.should.equal('RUNNING');

                scope.$apply();
                animate.flush();

                scope.status.should.equal('FINISHED');

                element.hasClass('a-class-name--start').should.be.false;
            });

            it('should return a promise', () => {
                let retval = controller.play();
                retval.then.should.be.a('function');
            });

            it('should resolve the promise when done', () => {
                let retval = controller.play(),
                    spy = sandbox.spy();

                retval.then(spy);
                spy.should.not.have.been.called;

                scope.$apply();
                spy.should.not.have.been.called;

                animate.flush();
                spy.should.have.been.calledOnce;
            });
        });

        describe('#clear', () => {
            it('should be defined', () => {
                controller.clear.should.be.a('function');
            });

            it('should add the prefixed class', () => {
                controller.play();
                scope.$apply();

                element.hasClass('a-class-name--start').should.be.false;

                controller.clear();
                scope.$apply();
                element.hasClass('a-class-name--start').should.be.true;
            });

            it('should update status correctly when animation finished', () => {
                controller.play();
                scope.$apply();
                animate.flush();
                scope.status.should.equal('FINISHED');

                controller.clear();
                scope.status.should.equal('READY');
            });

            it('should update status correctly when animation running', () => {
                controller.play();
                scope.$apply();

                scope.status.should.equal('RUNNING');

                controller.clear();
                animate.flush();
                scope.status.should.equal('READY');
            });

            it('should return a promise', () => {
                controller.clear().then.should.be.a('function');
            });

            it('should resolve the promise when done (immediately)', () => {
                let spy = sandbox.spy();
                controller.clear().then(spy);

                spy.should.not.have.been.called;

                scope.$apply();
                spy.should.have.been.calledOnce;
            });

            it('should resolve the "play" promise if still running', () => {
                let spy = sandbox.spy();
                controller.play().then(spy);

                spy.should.not.have.been.called;

                scope.$apply();
                spy.should.not.have.been.called;

                controller.clear();

                scope.$apply();
                spy.should.have.been.calledOnce;
            });
        });
    });
});
