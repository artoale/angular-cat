import catAnimations from '../src/js/cat.js';

describe('cat', () => {
    it('should be defined', () => {
        catAnimations.should.be.defined;
    });

    it('should be an angular module', () => {
        catAnimations.name.should.equal('cat');
    });
});
