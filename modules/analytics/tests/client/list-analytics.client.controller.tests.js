(function () {
  'use strict';

  describe('Analytics List Controller Tests', function () {
    // Initialize global variables
    var AnalyticsListController,
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

      // create mock article
      mockAnalytic = new AnalyticsService({
        _id: '525a8422f6d0f87f0e407a33',
        name: 'Analytic Name'
      });

      // Mock logged in user
      Authentication.user = {
        roles: ['user']
      };

      // Initialize the Analytics List controller.
      AnalyticsListController = $controller('AnalyticsListController as vm', {
        $scope: $scope
      });

      // Spy on state go
      spyOn($state, 'go');
    }));

    describe('Instantiate', function () {
      var mockAnalyticList;

      beforeEach(function () {
        mockAnalyticList = [mockAnalytic, mockAnalytic];
      });

      it('should send a GET request and return all Analytics', inject(function (AnalyticsService) {
        // Set POST response
        $httpBackend.expectGET('api/analytics').respond(mockAnalyticList);


        $httpBackend.flush();

        // Test form inputs are reset
        expect($scope.vm.analytics.length).toEqual(2);
        expect($scope.vm.analytics[0]).toEqual(mockAnalytic);
        expect($scope.vm.analytics[1]).toEqual(mockAnalytic);

      }));
    });
  });
}());
