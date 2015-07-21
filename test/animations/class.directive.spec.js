describe('pa-class directive', () => {
    let element,
        scope = {},
        template = `
            <div
                pa-class="a-class-name"
                pa-active="visible"
                pa-status="status"
            ></div>
            `,
        compile,
        animate,
        timeout;
    beforeEach(angular.mock.module('pa.animations.class'));
    beforeEach(angular.mock.module('ngAnimateMock'));

    beforeEach(angular.mock.inject(($compile, $rootScope, $timeout, $animate) => {
        scope = $rootScope.$new();
        animate = $animate;
        scope.visible = true;
        compile = () => {
            element = angular.element(template);
            $compile(element)(scope);
        };

        timeout =  $timeout;
    }));

    it('should add a class with --start suffix', () => {
        compile();
        element.hasClass('a-class-name--start').should.be.true;
    });

    it('should set the status to READY if variable is binded', () => {
        compile();
        scope.status.should.equal('READY');
    });

    describe('active watch', () => {
        it('should remove the prefixed class', () => {
            compile();
            scope.visible = true;
            scope.$apply();
            element.hasClass('a-class-name--start').should.be.false;
            animate.triggerCallbacks();
        });

        it('should set the status to "RUNNING", then to "FINISHED"', () => {
            compile();
            scope.visible = true;
            scope.$apply();
            scope.status.should.equal('RUNNING');

            animate.triggerCallbacks();
            scope.status.should.equal('FINISHED');
        });
    });
});
