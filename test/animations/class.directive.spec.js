describe('pa-class directive', () => {
    let element,
        scope = {},
        template = `
            <div pa-class="a-class-name" pa-active="visible"></div>
            `;
    beforeEach(angular.mock.module('pa.animations.class'));

    beforeEach(angular.mock.inject(($compile, $rootScope) => {
        scope = $rootScope.$new();
        scope.visible = true;
        element = angular.element(template);
        $compile(element)(scope);
    }));

    it('should add a --start suffix', () => {
        element.hasClass('a-class-name--start').should.be.true;

    });
});
