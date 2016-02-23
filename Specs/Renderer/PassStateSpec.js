/*global defineSuite*/
defineSuite([
        'Renderer/PassState'
    ], function(
        PassState) {
    'use strict';

    it('creates a pass state', function() {
        var context = {};
        var passState = new PassState(context);
        expect(passState.context).toBe(context);
        expect(passState.framebuffer).toBeUndefined();
        expect(passState.blendingEnabled).toBeUndefined();
        expect(passState.scissorTest).toBeUndefined();
    });
});
