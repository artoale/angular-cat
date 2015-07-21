import paAnimations from '../src/js/paAnimations.js';

describe('paAnimations', () => {
    it('should be defined', () => {
        paAnimations.should.be.defined;
    });

    it('should be an angular module', () => {
        paAnimations.name.should.equal('paAnimations');
    });
});
