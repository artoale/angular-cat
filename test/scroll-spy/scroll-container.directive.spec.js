import scrollSpy from '../../src/js/scroll-spy/scroll-container.directive';

describe('scrollSpy', () => {
    let compile,
        rootScope,
        scope,
        window,
        timeout,
        element,
        controller,
        template = `
            <div pa-scroll-container>
        `;

    beforeEach(angular.mock.module('pa.scrollSpy.scrollContainer'));
    beforeEach(angular.mock.inject(($compile, $rootScope, $timeout, $window) => {
        compile = $compile;
        window = $window;
        rootScope = $rootScope;
        scope = $rootScope.$new();
        timeout = $timeout;
        element = compile(template)(scope);
        controller = element.controller('paScrollContainer');
    }));

    it('should be defined', () => {
        scrollSpy.should.be.defined;
    });

    it('should be an angular module', () => {
        scrollSpy.name.should.equal('pa.scrollSpy.scrollContainer');
    });

    describe('controller', () => {
        it('should be defined', () => {
            controller.should.be.defined;
        });

        describe('registerSpy', () => {
            it('should be defined', () => {
                controller.registerSpy.should.be.a('function');
            });

            it('should register a spy', () => {
                let spy = {
                    getRect: sinon.spy(() => {
                        return {
                            top: 500,
                            height: 500
                        };
                    }),
                    setInView: sinon.spy()
                };
                controller.registerSpy(spy);
                controller.spies.length.should.be.equal(1);
            });
        });

        describe('getScrollContainer', () => {
            it('should be defined', () => {
                controller.getScrollContainer.should.be.a('function');
            });

            it('should return the scrollContainer DOM node', () => {
                var node = controller.getScrollContainer();
                node.should.be.equal(element[0]);
            });
        });
    });
});
