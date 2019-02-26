(function () {
  'use strict';

  describe('Preregistrations Route Tests', function () {
    // Initialize global variables
    var $scope,
      PreregistrationsService;

    // We can start by loading the main application module
    beforeEach(module(ApplicationConfiguration.applicationModuleName));

    // The injector ignores leading and trailing underscores here (i.e. _$httpBackend_).
    // This allows us to inject a service but then attach it to a variable
    // with the same name as the service.
    beforeEach(inject(function ($rootScope, _PreregistrationsService_) {
      // Set a new global scope
      $scope = $rootScope.$new();
      PreregistrationsService = _PreregistrationsService_;
    }));

    describe('Route Config', function () {
      describe('Main Route', function () {
        var mainstate;
        beforeEach(inject(function ($state) {
          mainstate = $state.get('preregistrations');
        }));

        it('Should have the correct URL', function () {
          expect(mainstate.url).toEqual('/preregistrations');
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
          PreregistrationsController,
          mockPreregistration;

        beforeEach(inject(function ($controller, $state, $templateCache) {
          viewstate = $state.get('preregistrations.view');
          $templateCache.put('modules/preregistrations/client/views/view-preregistration.client.view.html', '');

          // create mock Preregistration
          mockPreregistration = new PreregistrationsService({
            _id: '525a8422f6d0f87f0e407a33',
            name: 'Preregistration Name'
          });

          // Initialize Controller
          PreregistrationsController = $controller('PreregistrationsController as vm', {
            $scope: $scope,
            preregistrationResolve: mockPreregistration
          });
        }));

        it('Should have the correct URL', function () {
          expect(viewstate.url).toEqual('/:preregistrationId');
        });

        it('Should have a resolve function', function () {
          expect(typeof viewstate.resolve).toEqual('object');
          expect(typeof viewstate.resolve.preregistrationResolve).toEqual('function');
        });

        it('should respond to URL', inject(function ($state) {
          expect($state.href(viewstate, {
            preregistrationId: 1
          })).toEqual('/preregistrations/1');
        }));

        it('should attach an Preregistration to the controller scope', function () {
          expect($scope.vm.preregistration._id).toBe(mockPreregistration._id);
        });

        it('Should not be abstract', function () {
          expect(viewstate.abstract).toBe(undefined);
        });

        it('Should have templateUrl', function () {
          expect(viewstate.templateUrl).toBe('modules/preregistrations/client/views/view-preregistration.client.view.html');
        });
      });

      describe('Create Route', function () {
        var createstate,
          PreregistrationsController,
          mockPreregistration;

        beforeEach(inject(function ($controller, $state, $templateCache) {
          createstate = $state.get('preregistrations.create');
          $templateCache.put('modules/preregistrations/client/views/form-preregistration.client.view.html', '');

          // create mock Preregistration
          mockPreregistration = new PreregistrationsService();

          // Initialize Controller
          PreregistrationsController = $controller('PreregistrationsController as vm', {
            $scope: $scope,
            preregistrationResolve: mockPreregistration
          });
        }));

        it('Should have the correct URL', function () {
          expect(createstate.url).toEqual('/create');
        });

        it('Should have a resolve function', function () {
          expect(typeof createstate.resolve).toEqual('object');
          expect(typeof createstate.resolve.preregistrationResolve).toEqual('function');
        });

        it('should respond to URL', inject(function ($state) {
          expect($state.href(createstate)).toEqual('/preregistrations/create');
        }));

        it('should attach an Preregistration to the controller scope', function () {
          expect($scope.vm.preregistration._id).toBe(mockPreregistration._id);
          expect($scope.vm.preregistration._id).toBe(undefined);
        });

        it('Should not be abstract', function () {
          expect(createstate.abstract).toBe(undefined);
        });

        it('Should have templateUrl', function () {
          expect(createstate.templateUrl).toBe('modules/preregistrations/client/views/form-preregistration.client.view.html');
        });
      });

      describe('Edit Route', function () {
        var editstate,
          PreregistrationsController,
          mockPreregistration;

        beforeEach(inject(function ($controller, $state, $templateCache) {
          editstate = $state.get('preregistrations.edit');
          $templateCache.put('modules/preregistrations/client/views/form-preregistration.client.view.html', '');

          // create mock Preregistration
          mockPreregistration = new PreregistrationsService({
            _id: '525a8422f6d0f87f0e407a33',
            name: 'Preregistration Name'
          });

          // Initialize Controller
          PreregistrationsController = $controller('PreregistrationsController as vm', {
            $scope: $scope,
            preregistrationResolve: mockPreregistration
          });
        }));

        it('Should have the correct URL', function () {
          expect(editstate.url).toEqual('/:preregistrationId/edit');
        });

        it('Should have a resolve function', function () {
          expect(typeof editstate.resolve).toEqual('object');
          expect(typeof editstate.resolve.preregistrationResolve).toEqual('function');
        });

        it('should respond to URL', inject(function ($state) {
          expect($state.href(editstate, {
            preregistrationId: 1
          })).toEqual('/preregistrations/1/edit');
        }));

        it('should attach an Preregistration to the controller scope', function () {
          expect($scope.vm.preregistration._id).toBe(mockPreregistration._id);
        });

        it('Should not be abstract', function () {
          expect(editstate.abstract).toBe(undefined);
        });

        it('Should have templateUrl', function () {
          expect(editstate.templateUrl).toBe('modules/preregistrations/client/views/form-preregistration.client.view.html');
        });

        xit('Should go to unauthorized route', function () {

        });
      });

    });
  });
}());
