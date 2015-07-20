import {myVar} from '../src/js/main'
describe('test', () => {
    it('should run', () => {
        myVar.should.be.a('string');
        myVar.should.be.equal('TESTTEST');
    });
});
