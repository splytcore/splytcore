(function () {
  'use strict';

  describe('Analytics Route Tests', function () {
    // Initialize global variables
    var $scope,
      AnalyticsService;

    // We can start by loading the main application module
    beforeEach(module(ApplicationConfiguration.applicationModuleName));

    // The injector ignores leading and trailing underscores here (i.e. _$httpBackend_).
    // This allows us to inject a service but then attach it to a variable
    // with the same name as the service.
    beforeEach(inject(function ($rootScope, _AnalyticsService_) {
      // Set a new global scope
      $scope = $rootScope.$new();
      AnalyticsService = _AnalyticsService_;
    }));

    describe('Route Config', function () {
      describe('Main Route', function () {
        var mainstate;
        beforeEach(inject(function ($state) {
          mainstate = $state.get('analytics');
        }));

        it('Should have the correct URL', function () {
          expect(mainstate.url).toEqual('/analytics');
        });

        it('Should be abstract', function () {
          expect(mainstate.abstract).toBe(true);
        });

        it('Should have template', function () {
          expect(mainstate.template).toBe('<ui-view/>');
        });
      });

      describe('View Route', function () {
        var viewstate,
          AnalyticsController,
          mockAnalytic;

        beforeEach(inject(function ($controller, $state, $templateCache) {
          viewstate = $state.get('analytics.view');
          $templateCache.put('modules/analytics/client/views/view-analytic.client.view.html', '');

          // create mock Analytic
          mockAnalytic = new AnalyticsService({
            _id: '525a8422f6d0f87f0e407a33',
            name: 'Analytic Name'
          });

          // Initialize Controller
          AnalyticsController = $controller('AnalyticsController as vm', {
            $scope: $scope,
            analyticResolve: mockAnalytic
          });
        }));

        it('Should have the correct URL', function () {
          expect(viewstate.url).toEqual('/:analyticId');
        });

        it('Should have a resolve function', function () {
          expect(typeof viewstate.resolve).toEqual('object');
          expect(typeof viewstate.resolve.analyticResolve).toEqual('function');
        });

        it('should respond to URL', inject(function ($state) {
          expect($state.href(viewstate, {
            analyticId: 1
          })).toEqual('/analytics/1');
        }));

        it('should attach an Analytic to the controller scope', function () {
          expect($scope.vm.analytic._id).toBe(mockAnalytic._id);
        });

        it('Should not be abstract', function () {
          expect(viewstate.abstract).toBe(undefined);
        });

        it('Should have templateUrl', function () {
          expect(viewstate.templateUrl).toBe('modules/analytics/client/views/view-analytic.client.view.html');
        });
      });

      describe('Create Route', function () {
        var createstate,
          AnalyticsController,
          mockAnalytic;

        beforeEach(inject(function ($controller, $state, $templateCache) {
          createstate = $state.get('analytics.create');
          $templateCache.put('modules/analytics/client/views/form-analytic.client.view.html', '');

          // create mock Analytic
          mockAnalytic = new AnalyticsService();

          // Initialize Controller
          AnalyticsController = $controller('AnalyticsController as vm', {
            $scope: $scope,
            analyticResolve: mockAnalytic
          });
        }));

        it('Should have the correct URL', function () {
          expect(createstate.url).toEqual('/create');
        });

        it('Should have a resolve function', function () {
          expect(typeof createstate.resolve).toEqual('object');
          expect(typeof createstate.resolve.analyticResolve).toEqual('function');
        });

        it('should respond to URL', inject(function ($state) {
          expect($state.href(createstate)).toEqual('/analytics/create');
        }));

        it('should attach an Analytic to the controller scope', function () {
          expect($scope.vm.analytic._id).toBe(mockAnalytic._id);
          expect($scope.vm.analytic._id).toBe(undefined);
        });

        it('Should not be abstract', function () {
          expect(createstate.abstract).toBe(undefined);
        });

        it('Should have templateUrl', function () {
          expect(createstate.templateUrl).toBe('modules/analytics/client/views/form-analytic.client.view.html');
        });
      });

      describe('Edit Route', function () {
        var editstate,
          AnalyticsController,
          mockAnalytic;

        beforeEach(inject(function ($controller, $state, $templateCache) {
          editstate = $state.get('analytics.edit');
          $templateCache.put('modules/analytics/client/views/form-analytic.client.view.html', '');

          // create mock Analytic
          mockAnalytic = new AnalyticsService({
            _id: '525a8422f6d0f87f0e407a33',
            name: 'Analytic Name'
          });

          // Initialize Controller
          AnalyticsController = $controller('AnalyticsController as vm', {
            $scope: $scope,
            analyticResolve: mockAnalytic
          });
        }));

        it('Should have the correct URL', function () {
          expect(editstate.url).toEqual('/:analyticId/edit');
        });

        it('Should have a resolve function', function () {
          expect(typeof editstate.resolve).toEqual('object');
          expect(typeof editstate.resolve.analyticResolve).toEqual('function');
        });

        it('should respond to URL', inject(function ($state) {
          expect($state.href(editstate, {
            analyticId: 1
          })).toEqual('/analytics/1/edit');
        }));

        it('should attach an Analytic to the controller scope', function () {
          expect($scope.vm.analytic._id).toBe(mockAnalytic._id);
        });

        it('Should not be abstract', function () {
          expect(editstate.abstract).toBe(undefined);
        });

        it('Should have templateUrl', function () {
          expect(editstate.templateUrl).toBe('modules/analytics/client/views/form-analytic.client.view.html');
        });

        xit('Should go to unauthorized route', function () {

        });
      });

    });
  });
}());
