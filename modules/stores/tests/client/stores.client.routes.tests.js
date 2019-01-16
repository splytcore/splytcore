(function () {
  'use strict';

  describe('Stores Route Tests', function () {
    // Initialize global variables
    var $scope,
      StoresService;

    // We can start by loading the main application module
    beforeEach(module(ApplicationConfiguration.applicationModuleName));

    // The injector ignores leading and trailing underscores here (i.e. _$httpBackend_).
    // This allows us to inject a service but then attach it to a variable
    // with the same name as the service.
    beforeEach(inject(function ($rootScope, _StoresService_) {
      // Set a new global scope
      $scope = $rootScope.$new();
      StoresService = _StoresService_;
    }));

    describe('Route Config', function () {
      describe('Main Route', function () {
        var mainstate;
        beforeEach(inject(function ($state) {
          mainstate = $state.get('stores');
        }));

        it('Should have the correct URL', function () {
          expect(mainstate.url).toEqual('/stores');
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
          StoresController,
          mockStore;

        beforeEach(inject(function ($controller, $state, $templateCache) {
          viewstate = $state.get('stores.view');
          $templateCache.put('modules/stores/client/views/view-store.client.view.html', '');

          // create mock Store
          mockStore = new StoresService({
            _id: '525a8422f6d0f87f0e407a33',
            name: 'Store Name'
          });

          // Initialize Controller
          StoresController = $controller('StoresController as vm', {
            $scope: $scope,
            storeResolve: mockStore
          });
        }));

        it('Should have the correct URL', function () {
          expect(viewstate.url).toEqual('/:storeId');
        });

        it('Should have a resolve function', function () {
          expect(typeof viewstate.resolve).toEqual('object');
          expect(typeof viewstate.resolve.storeResolve).toEqual('function');
        });

        it('should respond to URL', inject(function ($state) {
          expect($state.href(viewstate, {
            storeId: 1
          })).toEqual('/stores/1');
        }));

        it('should attach an Store to the controller scope', function () {
          expect($scope.vm.store._id).toBe(mockStore._id);
        });

        it('Should not be abstract', function () {
          expect(viewstate.abstract).toBe(undefined);
        });

        it('Should have templateUrl', function () {
          expect(viewstate.templateUrl).toBe('modules/stores/client/views/view-store.client.view.html');
        });
      });

      describe('Create Route', function () {
        var createstate,
          StoresController,
          mockStore;

        beforeEach(inject(function ($controller, $state, $templateCache) {
          createstate = $state.get('stores.create');
          $templateCache.put('modules/stores/client/views/form-store.client.view.html', '');

          // create mock Store
          mockStore = new StoresService();

          // Initialize Controller
          StoresController = $controller('StoresController as vm', {
            $scope: $scope,
            storeResolve: mockStore
          });
        }));

        it('Should have the correct URL', function () {
          expect(createstate.url).toEqual('/create');
        });

        it('Should have a resolve function', function () {
          expect(typeof createstate.resolve).toEqual('object');
          expect(typeof createstate.resolve.storeResolve).toEqual('function');
        });

        it('should respond to URL', inject(function ($state) {
          expect($state.href(createstate)).toEqual('/stores/create');
        }));

        it('should attach an Store to the controller scope', function () {
          expect($scope.vm.store._id).toBe(mockStore._id);
          expect($scope.vm.store._id).toBe(undefined);
        });

        it('Should not be abstract', function () {
          expect(createstate.abstract).toBe(undefined);
        });

        it('Should have templateUrl', function () {
          expect(createstate.templateUrl).toBe('modules/stores/client/views/form-store.client.view.html');
        });
      });

      describe('Edit Route', function () {
        var editstate,
          StoresController,
          mockStore;

        beforeEach(inject(function ($controller, $state, $templateCache) {
          editstate = $state.get('stores.edit');
          $templateCache.put('modules/stores/client/views/form-store.client.view.html', '');

          // create mock Store
          mockStore = new StoresService({
            _id: '525a8422f6d0f87f0e407a33',
            name: 'Store Name'
          });

          // Initialize Controller
          StoresController = $controller('StoresController as vm', {
            $scope: $scope,
            storeResolve: mockStore
          });
        }));

        it('Should have the correct URL', function () {
          expect(editstate.url).toEqual('/:storeId/edit');
        });

        it('Should have a resolve function', function () {
          expect(typeof editstate.resolve).toEqual('object');
          expect(typeof editstate.resolve.storeResolve).toEqual('function');
        });

        it('should respond to URL', inject(function ($state) {
          expect($state.href(editstate, {
            storeId: 1
          })).toEqual('/stores/1/edit');
        }));

        it('should attach an Store to the controller scope', function () {
          expect($scope.vm.store._id).toBe(mockStore._id);
        });

        it('Should not be abstract', function () {
          expect(editstate.abstract).toBe(undefined);
        });

        it('Should have templateUrl', function () {
          expect(editstate.templateUrl).toBe('modules/stores/client/views/form-store.client.view.html');
        });

        xit('Should go to unauthorized route', function () {

        });
      });

    });
  });
}());
