describe("SAFe Delivery Metrics App", function() {

    it('should render the app', function() {
        var app = Rally.test.Harness.launchApp("CArABU.app.safeDeliveryMetrics");
        expect(app.getEl()).toBeDefined();
    });

});
