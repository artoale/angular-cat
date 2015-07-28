import visible from '../../src/js/scroll-spy/visible.directive';

describe('visible', () => {
    let rootScope,
        scope,
        window,
        parentElement,
        element,
        api,
        scrollContainerController,
        template = `
            <div pa-fake-scroller>
                <p pa-visible="visible"></p>
            </div>
        `;

    beforeEach(angular.mock.module('pa.scrollSpy.visible'));
    beforeEach(() => {
        scrollContainerController = {
            registerSpy: sinon.spy(),
            getScrollContainer: sinon.spy(() => parentElement[0])
        };
    });

    beforeEach(angular.mock.inject(($compile, $rootScope, $timeout, $window) => {
        parentElement = angular.element(template);
        parentElement.data('$paScrollContainerController', scrollContainerController);
        rootScope = $rootScope;
        scope = $rootScope.$new();
        $compile(parentElement)(scope);
        element = parentElement.children();
        window = $window;
        api = scrollContainerController.registerSpy.args[0][0];
    }));

    it('should be defined', () => {
        visible.should.be.defined;
    });

    it('should be an angular module', () => {
        visible.name.should.equal('pa.scrollSpy.visible');
    });

    it('should get the scrollContainer DOM element', () => {
        scrollContainerController.getScrollContainer.should.have.been.called;
    });

    it('should register itself to the parent scrollContainer directive', () => {
        scrollContainerController.registerSpy.should.have.been.called;
    });

    it('should update his position on link', () => {
        scrollContainerController.registerSpy.should.have.been.called;
    });

    describe('api', () => {
        describe('update', () => {
            it('should be a function', () => {
                api.update.should.be.a('function');
            });

            it('should update the rect object calling getBoundingClientRect', () => {
                let updateRect = sinon.spy(element[0], 'getBoundingClientRect');
                api.update();
                updateRect.should.have.been.called;
            });
        });

        describe('getRect', () => {
            it('should be a function', () => {
                api.getRect.should.be.a('function');
            });
            it('should be a function', () => {
                api.getRect.should.be.a('function');
            });

        });

        describe('setInView', () => {
            it('should be a function', () => {
                api.setInView.should.be.a('function');
            });

            it('should set visible to true', () => {
                api.setInView(true);
                scope.$apply();
                scope.visible.should.be.true;
            });

            it('should set visible to false', () => {
                api.setInView(false);
                scope.$apply();
                scope.visible.should.be.false;
            });

            it('should call evalAsync id visible value changes', () => {
                let spyEval = sinon.spy(scope, '$evalAsync');
                scope.visible = true;
                scope.$apply();
                api.setInView(false);
                scope.$apply();
                spyEval.should.have.been.called;
            });

            it('should set visible to false', () => {
                let spyEval = sinon.spy(scope, '$evalAsync');
                scope.visible = false;
                scope.$apply();
                api.setInView(false);
                scope.$apply();
                spyEval.should.not.have.been.called;
            });
        });
    });

});
