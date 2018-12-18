(function () {
  'use strict';

  describe('Dashboards Route Tests', function () {
    // Initialize global variables
    var $scope,
      DashboardsService;

    // We can start by loading the main application module
    beforeEach(module(ApplicationConfiguration.applicationModuleName));

    // The injector ignores leading and trailing underscores here (i.e. _$httpBackend_).
    // This allows us to inject a service but then attach it to a variable
    // with the same name as the service.
    beforeEach(inject(function ($rootScope, _DashboardsService_) {
      // Set a new global scope
      $scope = $rootScope.$new();
      DashboardsService = _DashboardsService_;
    }));

    describe('Route Config', function () {
      describe('Main Route', function () {
        var mainstate;
        beforeEach(inject(function ($state) {
          mainstate = $state.get('dashboards');
        }));

        it('Should have the correct URL', function () {
          expect(mainstate.url).toEqual('/dashboards');
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
          DashboardsController,
          mockDashboard;

        beforeEach(inject(function ($controller, $state, $templateCache) {
          viewstate = $state.get('dashboards.view');
          $templateCache.put('modules/dashboards/client/views/view-dashboard.client.view.html', '');

          // create mock Dashboard
          mockDashboard = new DashboardsService({
            _id: '525a8422f6d0f87f0e407a33',
            name: 'Dashboard Name'
          });

          // Initialize Controller
          DashboardsController = $controller('DashboardsController as vm', {
            $scope: $scope,
            dashboardResolve: mockDashboard
          });
        }));

        it('Should have the correct URL', function () {
          expect(viewstate.url).toEqual('/:dashboardId');
        });

        it('Should have a resolve function', function () {
          expect(typeof viewstate.resolve).toEqual('object');
          expect(typeof viewstate.resolve.dashboardResolve).toEqual('function');
        });

        it('should respond to URL', inject(function ($state) {
          expect($state.href(viewstate, {
            dashboardId: 1
          })).toEqual('/dashboards/1');
        }));

        it('should attach an Dashboard to the controller scope', function () {
          expect($scope.vm.dashboard._id).toBe(mockDashboard._id);
        });

        it('Should not be abstract', function () {
          expect(viewstate.abstract).toBe(undefined);
        });

        it('Should have templateUrl', function () {
          expect(viewstate.templateUrl).toBe('modules/dashboards/client/views/view-dashboard.client.view.html');
        });
      });

      describe('Create Route', function () {
        var createstate,
          DashboardsController,
          mockDashboard;

        beforeEach(inject(function ($controller, $state, $templateCache) {
          createstate = $state.get('dashboards.create');
          $templateCache.put('modules/dashboards/client/views/form-dashboard.client.view.html', '');

          // create mock Dashboard
          mockDashboard = new DashboardsService();

          // Initialize Controller
          DashboardsController = $controller('DashboardsController as vm', {
            $scope: $scope,
            dashboardResolve: mockDashboard
          });
        }));

        it('Should have the correct URL', function () {
          expect(createstate.url).toEqual('/create');
        });

        it('Should have a resolve function', function () {
          expect(typeof createstate.resolve).toEqual('object');
          expect(typeof createstate.resolve.dashboardResolve).toEqual('function');
        });

        it('should respond to URL', inject(function ($state) {
          expect($state.href(createstate)).toEqual('/dashboards/create');
        }));

        it('should attach an Dashboard to the controller scope', function () {
          expect($scope.vm.dashboard._id).toBe(mockDashboard._id);
          expect($scope.vm.dashboard._id).toBe(undefined);
        });

        it('Should not be abstract', function () {
          expect(createstate.abstract).toBe(undefined);
        });

        it('Should have templateUrl', function () {
          expect(createstate.templateUrl).toBe('modules/dashboards/client/views/form-dashboard.client.view.html');
        });
      });

      describe('Edit Route', function () {
        var editstate,
          DashboardsController,
          mockDashboard;

        beforeEach(inject(function ($controller, $state, $templateCache) {
          editstate = $state.get('dashboards.edit');
          $templateCache.put('modules/dashboards/client/views/form-dashboard.client.view.html', '');

          // create mock Dashboard
          mockDashboard = new DashboardsService({
            _id: '525a8422f6d0f87f0e407a33',
            name: 'Dashboard Name'
          });

          // Initialize Controller
          DashboardsController = $controller('DashboardsController as vm', {
            $scope: $scope,
            dashboardResolve: mockDashboard
          });
        }));

        it('Should have the correct URL', function () {
          expect(editstate.url).toEqual('/:dashboardId/edit');
        });

        it('Should have a resolve function', function () {
          expect(typeof editstate.resolve).toEqual('object');
          expect(typeof editstate.resolve.dashboardResolve).toEqual('function');
        });

        it('should respond to URL', inject(function ($state) {
          expect($state.href(editstate, {
            dashboardId: 1
          })).toEqual('/dashboards/1/edit');
        }));

        it('should attach an Dashboard to the controller scope', function () {
          expect($scope.vm.dashboard._id).toBe(mockDashboard._id);
        });

        it('Should not be abstract', function () {
          expect(editstate.abstract).toBe(undefined);
        });

        it('Should have templateUrl', function () {
          expect(editstate.templateUrl).toBe('modules/dashboards/client/views/form-dashboard.client.view.html');
        });

        xit('Should go to unauthorized route', function () {

        });
      });

    });
  });
}());
