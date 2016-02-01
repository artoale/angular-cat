describe('catAnimationLink', () => {
    let sandbox,
        catAnimationLink,
        scope,
        controllers,
        selfController,
        attrs,
        timelineController;

    beforeEach(function() {
        sandbox = sinon.sandbox.create();
    });

    beforeEach(angular.mock.module('cat.animations.timeline'));
    beforeEach(angular.mock.module('cat.animations.delay'));
    beforeEach(angular.mock.module('cat.animations.baseAnimation'));
    beforeEach(angular.mock.module('cat.animations.animationLink'));
    beforeEach(angular.mock.module('ngAnimateMock'));

    beforeEach(function() {
        sandbox = sinon.sandbox.create();
    });

    beforeEach(angular.mock.inject(($rootScope, _catAnimationLink_) => {
        scope = $rootScope.$new();
        catAnimationLink =  _catAnimationLink_;
    }));

    //Mock controllers.
    beforeEach(function() {
        selfController = {
            setUp: sandbox.spy(),
            seek:  sandbox.spy(),
            play: sandbox.spy(),
            setDisabled: sandbox.spy(),
        };
        timelineController = {
            register: sandbox.spy()
        };
        controllers = [selfController, timelineController];
        attrs = {
            catAnimationName: 'foo',
        };
    });

    it('should be defined', () => {
        catAnimationLink.should.be.defined;
    });

    it('should setup the directive', () => {
        catAnimationLink(scope, null, attrs, controllers);
        selfController.setUp.should.have.been.calledOnce;
    });

    it('should setup the directive', () => {
        catAnimationLink(scope, null, attrs, controllers);
        selfController.setUp.should.have.been.calledOnce;
    });

    it('should register selfController on timeline controller if timelineController is defined', () => {
        catAnimationLink(scope, null, attrs, controllers);
        timelineController.register.should.have.been.calledOnce;
    });

    it('should register passing the animation name and the selfcontroller', () => {
        catAnimationLink(scope, null, attrs, controllers);
        timelineController.register.should.have.been.calledWith('foo', selfController);
    });

    it('should watch on catDisabled if defined and call the selfController setDisabled accordingly', () => {
        attrs.catDisabled = 'fooDisabled';
        scope.fooDisabled = false;
        catAnimationLink(scope, null, attrs, controllers);

        scope.$apply();
        selfController.setDisabled.should.have.been.calledWith(false);
        scope.fooDisabled = true;
        scope.$apply();
        selfController.setDisabled.secondCall.should.have.been.calledWith(true);
    });

    it('should watch on catActive if defined and call play when truethy', () => {
        attrs.catActive = 'fooActive';
        scope.fooActive = true;
        catAnimationLink(scope, null, attrs, controllers);

        scope.$apply();
        selfController.play.should.have.been.called;
    });

    it('should do nothing if active is set to false and catUndo is not defined', () => {
        attrs.catActive = 'fooActive';
        scope.fooActive = false;
        catAnimationLink(scope, null, attrs, controllers);

        scope.$apply();
        selfController.play.should.not.have.been.called;
    });

    it('should seek start if active is set to false and catUndo is defined', () => {
        attrs.catActive = 'fooActive';
        scope.fooActive = false;
        catAnimationLink(scope, null, attrs, controllers);

        scope.$apply();
        selfController.seek.should.not.have.been.calledWith('start');
    });

});
