(function () {
  'use strict';

  describe('Arbitrations Route Tests', function () {
    // Initialize global variables
    var $scope,
      ArbitrationsService;

    // We can start by loading the main application module
    beforeEach(module(ApplicationConfiguration.applicationModuleName));

    // The injector ignores leading and trailing underscores here (i.e. _$httpBackend_).
    // This allows us to inject a service but then attach it to a variable
    // with the same name as the service.
    beforeEach(inject(function ($rootScope, _ArbitrationsService_) {
      // Set a new global scope
      $scope = $rootScope.$new();
      ArbitrationsService = _ArbitrationsService_;
    }));

    describe('Route Config', function () {
      describe('Main Route', function () {
        var mainstate;
        beforeEach(inject(function ($state) {
          mainstate = $state.get('arbitrations');
        }));

        it('Should have the correct URL', function () {
          expect(mainstate.url).toEqual('/arbitrations');
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
          ArbitrationsController,
          mockArbitration;

        beforeEach(inject(function ($controller, $state, $templateCache) {
          viewstate = $state.get('arbitrations.view');
          $templateCache.put('modules/arbitrations/client/views/view-arbitration.client.view.html', '');

          // create mock Arbitration
          mockArbitration = new ArbitrationsService({
            _id: '525a8422f6d0f87f0e407a33',
            name: 'Arbitration Name'
          });

          // Initialize Controller
          ArbitrationsController = $controller('ArbitrationsController as vm', {
            $scope: $scope,
            arbitrationResolve: mockArbitration
          });
        }));

        it('Should have the correct URL', function () {
          expect(viewstate.url).toEqual('/:arbitrationId');
        });

        it('Should have a resolve function', function () {
          expect(typeof viewstate.resolve).toEqual('object');
          expect(typeof viewstate.resolve.arbitrationResolve).toEqual('function');
        });

        it('should respond to URL', inject(function ($state) {
          expect($state.href(viewstate, {
            arbitrationId: 1
          })).toEqual('/arbitrations/1');
        }));

        it('should attach an Arbitration to the controller scope', function () {
          expect($scope.vm.arbitration._id).toBe(mockArbitration._id);
        });

        it('Should not be abstract', function () {
          expect(viewstate.abstract).toBe(undefined);
        });

        it('Should have templateUrl', function () {
          expect(viewstate.templateUrl).toBe('modules/arbitrations/client/views/view-arbitration.client.view.html');
        });
      });

      describe('Create Route', function () {
        var createstate,
          ArbitrationsController,
          mockArbitration;

        beforeEach(inject(function ($controller, $state, $templateCache) {
          createstate = $state.get('arbitrations.create');
          $templateCache.put('modules/arbitrations/client/views/form-arbitration.client.view.html', '');

          // create mock Arbitration
          mockArbitration = new ArbitrationsService();

          // Initialize Controller
          ArbitrationsController = $controller('ArbitrationsController as vm', {
            $scope: $scope,
            arbitrationResolve: mockArbitration
          });
        }));

        it('Should have the correct URL', function () {
          expect(createstate.url).toEqual('/create');
        });

        it('Should have a resolve function', function () {
          expect(typeof createstate.resolve).toEqual('object');
          expect(typeof createstate.resolve.arbitrationResolve).toEqual('function');
        });

        it('should respond to URL', inject(function ($state) {
          expect($state.href(createstate)).toEqual('/arbitrations/create');
        }));

        it('should attach an Arbitration to the controller scope', function () {
          expect($scope.vm.arbitration._id).toBe(mockArbitration._id);
          expect($scope.vm.arbitration._id).toBe(undefined);
        });

        it('Should not be abstract', function () {
          expect(createstate.abstract).toBe(undefined);
        });

        it('Should have templateUrl', function () {
          expect(createstate.templateUrl).toBe('modules/arbitrations/client/views/form-arbitration.client.view.html');
        });
      });

      describe('Edit Route', function () {
        var editstate,
          ArbitrationsController,
          mockArbitration;

        beforeEach(inject(function ($controller, $state, $templateCache) {
          editstate = $state.get('arbitrations.edit');
          $templateCache.put('modules/arbitrations/client/views/form-arbitration.client.view.html', '');

          // create mock Arbitration
          mockArbitration = new ArbitrationsService({
            _id: '525a8422f6d0f87f0e407a33',
            name: 'Arbitration Name'
          });

          // Initialize Controller
          ArbitrationsController = $controller('ArbitrationsController as vm', {
            $scope: $scope,
            arbitrationResolve: mockArbitration
          });
        }));

        it('Should have the correct URL', function () {
          expect(editstate.url).toEqual('/:arbitrationId/edit');
        });

        it('Should have a resolve function', function () {
          expect(typeof editstate.resolve).toEqual('object');
          expect(typeof editstate.resolve.arbitrationResolve).toEqual('function');
        });

        it('should respond to URL', inject(function ($state) {
          expect($state.href(editstate, {
            arbitrationId: 1
          })).toEqual('/arbitrations/1/edit');
        }));

        it('should attach an Arbitration to the controller scope', function () {
          expect($scope.vm.arbitration._id).toBe(mockArbitration._id);
        });

        it('Should not be abstract', function () {
          expect(editstate.abstract).toBe(undefined);
        });

        it('Should have templateUrl', function () {
          expect(editstate.templateUrl).toBe('modules/arbitrations/client/views/form-arbitration.client.view.html');
        });

        xit('Should go to unauthorized route', function () {

        });
      });

    });
  });
}());
