import scrollSpyModule from '../../src/js/scroll-spy/scroll-spy.module';

describe('scrollSpyModule', () => {
    it('should be defined', () => {
        scrollSpyModule.should.be.defined;
    });

    it('should be an angular module', () => {
        scrollSpyModule.name.should.equal('pa.scrollSpy');
    });
});
