(function () {
  'use strict';

  describe('Analytics Controller Tests', function () {
    // Initialize global variables
    var AnalyticsController,
      $scope,
      $httpBackend,
      $state,
      Authentication,
      AnalyticsService,
      mockAnalytic;

    // The $resource service augments the response object with methods for updating and deleting the resource.
    // If we were to use the standard toEqual matcher, our tests would fail because the test values would not match
    // the responses exactly. To solve the problem, we define a new toEqualData Jasmine matcher.
    // When the toEqualData matcher compares two objects, it takes only object properties into
    // account and ignores methods.
    beforeEach(function () {
      jasmine.addMatchers({
        toEqualData: function (util, customEqualityTesters) {
          return {
            compare: function (actual, expected) {
              return {
                pass: angular.equals(actual, expected)
              };
            }
          };
        }
      });
    });

    // Then we can start by loading the main application module
    beforeEach(module(ApplicationConfiguration.applicationModuleName));

    // The injector ignores leading and trailing underscores here (i.e. _$httpBackend_).
    // This allows us to inject a service but then attach it to a variable
    // with the same name as the service.
    beforeEach(inject(function ($controller, $rootScope, _$state_, _$httpBackend_, _Authentication_, _AnalyticsService_) {
      // Set a new global scope
      $scope = $rootScope.$new();

      // Point global variables to injected services
      $httpBackend = _$httpBackend_;
      $state = _$state_;
      Authentication = _Authentication_;
      AnalyticsService = _AnalyticsService_;

      // create mock Analytic
      mockAnalytic = new AnalyticsService({
        _id: '525a8422f6d0f87f0e407a33',
        name: 'Analytic Name'
      });

      // Mock logged in user
      Authentication.user = {
        roles: ['user']
      };

      // Initialize the Analytics controller.
      AnalyticsController = $controller('AnalyticsController as vm', {
        $scope: $scope,
        analyticResolve: {}
      });

      // Spy on state go
      spyOn($state, 'go');
    }));

    describe('vm.save() as create', function () {
      var sampleAnalyticPostData;

      beforeEach(function () {
        // Create a sample Analytic object
        sampleAnalyticPostData = new AnalyticsService({
          name: 'Analytic Name'
        });

        $scope.vm.analytic = sampleAnalyticPostData;
      });

      it('should send a POST request with the form input values and then locate to new object URL', inject(function (AnalyticsService) {
        // Set POST response
        $httpBackend.expectPOST('api/analytics', sampleAnalyticPostData).respond(mockAnalytic);

        // Run controller functionality
        $scope.vm.save(true);
        $httpBackend.flush();

        // Test URL redirection after the Analytic was created
        expect($state.go).toHaveBeenCalledWith('analytics.view', {
          analyticId: mockAnalytic._id
        });
      }));

      it('should set $scope.vm.error if error', function () {
        var errorMessage = 'this is an error message';
        $httpBackend.expectPOST('api/analytics', sampleAnalyticPostData).respond(400, {
          message: errorMessage
        });

        $scope.vm.save(true);
        $httpBackend.flush();

        expect($scope.vm.error).toBe(errorMessage);
      });
    });

    describe('vm.save() as update', function () {
      beforeEach(function () {
        // Mock Analytic in $scope
        $scope.vm.analytic = mockAnalytic;
      });

      it('should update a valid Analytic', inject(function (AnalyticsService) {
        // Set PUT response
        $httpBackend.expectPUT(/api\/analytics\/([0-9a-fA-F]{24})$/).respond();

        // Run controller functionality
        $scope.vm.save(true);
        $httpBackend.flush();

        // Test URL location to new object
        expect($state.go).toHaveBeenCalledWith('analytics.view', {
          analyticId: mockAnalytic._id
        });
      }));

      it('should set $scope.vm.error if error', inject(function (AnalyticsService) {
        var errorMessage = 'error';
        $httpBackend.expectPUT(/api\/analytics\/([0-9a-fA-F]{24})$/).respond(400, {
          message: errorMessage
        });

        $scope.vm.save(true);
        $httpBackend.flush();

        expect($scope.vm.error).toBe(errorMessage);
      }));
    });

    describe('vm.remove()', function () {
      beforeEach(function () {
        // Setup Analytics
        $scope.vm.analytic = mockAnalytic;
      });

      it('should delete the Analytic and redirect to Analytics', function () {
        // Return true on confirm message
        spyOn(window, 'confirm').and.returnValue(true);

        $httpBackend.expectDELETE(/api\/analytics\/([0-9a-fA-F]{24})$/).respond(204);

        $scope.vm.remove();
        $httpBackend.flush();

        expect($state.go).toHaveBeenCalledWith('analytics.list');
      });

      it('should should not delete the Analytic and not redirect', function () {
        // Return false on confirm message
        spyOn(window, 'confirm').and.returnValue(false);

        $scope.vm.remove();

        expect($state.go).not.toHaveBeenCalled();
      });
    });
  });
}());
