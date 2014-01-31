/*global defineSuite*/
defineSuite([
         'Widgets/InfoBox/InfoBoxViewModel',
         'Core/Ellipsoid',
         'Scene/SceneTransitioner',
         'Specs/createScene',
         'Specs/destroyScene'
     ], function(
         InfoBoxViewModel,
         Ellipsoid,
         SceneTransitioner,
         createScene,
         destroyScene) {
    "use strict";
    /*global jasmine,describe,xdescribe,it,xit,expect,beforeEach,afterEach,beforeAll,afterAll,spyOn,runs,waits,waitsFor*/

    it('constructor sets expected values', function() {
        var viewModel = new InfoBoxViewModel();
        expect(viewModel.enableCamera).toBe(false);
        expect(viewModel.isCameraTracking).toBe(false);
        expect(viewModel.showInfo).toBe(false);
        expect(viewModel.cameraClicked).toBeDefined();
        expect(viewModel.closeClicked).toBeDefined();
        expect(viewModel.descriptionRawHtml).toBe('');
        expect(viewModel.maxHeightOffset(0)).toBeDefined();
        expect(viewModel.sanitizer).toBeDefined();
    });

    it('allows some HTML in description', function() {
        var safeString = '<p>This is a test.</p>';
        var viewModel = new InfoBoxViewModel();
        viewModel.descriptionRawHtml = safeString;
        waitsFor(function() {
            return viewModel.descriptionSanitizedHtml !== '';
        });
        runs(function() {
            expect(viewModel.descriptionSanitizedHtml).toBe(safeString);
        });
    });

    it('removes script tags from HTML description by default', function() {
        var evilString = 'Testing. <script>console.error("Scripts are disallowed by default.");</script>';
        var viewModel = new InfoBoxViewModel();
        viewModel.descriptionRawHtml = evilString;
        waitsFor(function() {
            return viewModel.descriptionSanitizedHtml !== '';
        });
        runs(function() {
            expect(viewModel.descriptionSanitizedHtml).toContain('Testing.');
            expect(viewModel.descriptionSanitizedHtml).not.toContain('script');
        });
    });

    it('indicates missing description', function() {
        var viewModel = new InfoBoxViewModel();
        expect(viewModel._bodyless).toBe(true);
        viewModel.descriptionRawHtml = 'Testing';
        waitsFor(function() {
            return viewModel.descriptionSanitizedHtml !== '';
        });
        runs(function() {
            expect(viewModel._bodyless).toBe(false);
        });
    });

    function customSanitizer(string) {
        return string + ' (processed by customSanitizer)';
    }

    it('allows user-supplied HTML sanitization.', function() {
        var testString = 'Testing hot-swap of custom sanitizer.';
        var viewModel = new InfoBoxViewModel();

        viewModel.descriptionRawHtml = testString;
        waitsFor(function() {
            return viewModel.descriptionSanitizedHtml !== '';
        });
        runs(function() {
            expect(viewModel.descriptionSanitizedHtml).toBe(testString);

            viewModel.sanitizer = customSanitizer;
            expect(viewModel.descriptionSanitizedHtml).toContain(testString);
            expect(viewModel.descriptionSanitizedHtml).toContain('processed by customSanitizer');
            testString = 'subsequent test, after the swap.';
            viewModel.descriptionRawHtml = testString;
            expect(viewModel.descriptionSanitizedHtml).toContain(testString);
            expect(viewModel.descriptionSanitizedHtml).toContain('processed by customSanitizer');
        });
    });

    it('camera icon changes when tracking is not available, unless due to active tracking', function() {
        var viewModel = new InfoBoxViewModel();
        viewModel.enableCamera = true;
        var enabledCameraPath = viewModel._cameraIconPath;
        viewModel.enableCamera = false;
        expect(viewModel._cameraIconPath).not.toBe(enabledCameraPath);
        viewModel.isCameraTracking = true;
        expect(viewModel._cameraIconPath).toBe(enabledCameraPath);
    });
});