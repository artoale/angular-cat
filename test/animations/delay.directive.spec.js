describe('cat-delay directive', () => {
    let element,
        scope = {},
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
        animate,
        timelineController = {
            register() {
                return;
            }
        },
        timeout;
    beforeEach(angular.mock.module('cat.utils.delay'));
    beforeEach(angular.mock.module('cat.animations.animationLink'));
    beforeEach(angular.mock.module('cat.animations.delay'));
    beforeEach(angular.mock.module('ngAnimateMock'));

    beforeEach(angular.mock.inject(($compile, $rootScope, $timeout, $animate) => {
        scope = $rootScope.$new();
        animate = $animate;
        scope.visible = false;
        compile = () => {
            let parentElement = angular.element(template);
            parentElement.data('$catTimelineController', timelineController);
            $compile(parentElement)(scope);
            element = parentElement.children();
        };

        timeout =  $timeout;
    }));


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

    describe('active watch', () => {
        it('should update status correctly', () => {
            compile();
            scope.status.should.equal('READY');

            scope.visible = true;
            scope.$apply();

            scope.status.should.equal('RUNNING');
            timeout.flush(300);
            scope.status.should.equal('FINISHED');
        });

        it('should reset status if undo is set', () => {
            let oldTemplate = template;
            template = `
                <div>
                    <div
                        cat-delay="300"
                        cat-active="visible"
                        cat-status="status"
                        cat-undo=1
                    ></div>
                </div>
                `;
            compile();

            scope.visible = true;
            scope.$apply();

            scope.status.should.equal('RUNNING');
            timeout.flush(100);

            scope.status.should.equal('RUNNING');

            scope.visible = false;
            scope.$apply();

            scope.status.should.equal('READY');

            timeout.flush(200);

            scope.status.should.equal('READY');
            template = oldTemplate;
        });


    });

    describe('controller', () => {
        let controller;

        beforeEach(() => {
            compile();
            controller = element.controller('catDelay');
        });

        describe('#play', () => {
            it('should be defined', () => {
                controller.play.should.be.a('function');
            });

            it('should return a promise', () => {
                controller.play().then.should.be.defined;
            });

            it('should resolve the animation promise after the specified delay', () => {
                let spy = sinon.spy();
                controller.play().then(spy);
                spy.should.not.have.been.called;
                timeout.flush(300);
                spy.should.have.been.calledOnce;
            });

            it('should update status correctly', () => {
                scope.status.should.equal('READY');

                controller.play();
                scope.$apply();

                scope.status.should.equal('RUNNING');
                timeout.flush(300);
                scope.status.should.equal('FINISHED');
            });

        });

        describe('#clear', () => {
            it('should be defined', () => {
                controller.clear.should.be.a('function');
            });

        });
    });
});
