describe('paDelay service', () => {
    let timeout,
        delay;
    beforeEach(angular.mock.module('pa.utils.delay'));

    beforeEach(angular.mock.inject((paDelayS, $timeout) => {
        delay = paDelayS;
        timeout =  $timeout;
    }));

    it('should be a function', () => {
        delay.should.be.a('function');
    });

    it('should delay the execution', () => {
        let spy = sinon.spy();
        delay(100).then(spy);
        spy.should.not.have.been.called;
        timeout.flush(99);
        spy.should.not.have.been.called;
        timeout.flush(1);
        spy.should.have.been.calledOnce;
    });
});
