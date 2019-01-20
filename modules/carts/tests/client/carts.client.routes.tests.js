(function () {
  'use strict';

  describe('Carts Route Tests', function () {
    // Initialize global variables
    var $scope,
      CartsService;

    // We can start by loading the main application module
    beforeEach(module(ApplicationConfiguration.applicationModuleName));

    // The injector ignores leading and trailing underscores here (i.e. _$httpBackend_).
    // This allows us to inject a service but then attach it to a variable
    // with the same name as the service.
    beforeEach(inject(function ($rootScope, _CartsService_) {
      // Set a new global scope
      $scope = $rootScope.$new();
      CartsService = _CartsService_;
    }));

    describe('Route Config', function () {
      describe('Main Route', function () {
        var mainstate;
        beforeEach(inject(function ($state) {
          mainstate = $state.get('carts');
        }));

        it('Should have the correct URL', function () {
          expect(mainstate.url).toEqual('/carts');
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
          CartsController,
          mockCart;

        beforeEach(inject(function ($controller, $state, $templateCache) {
          viewstate = $state.get('carts.view');
          $templateCache.put('modules/carts/client/views/view-cart.client.view.html', '');

          // create mock Cart
          mockCart = new CartsService({
            _id: '525a8422f6d0f87f0e407a33',
            name: 'Cart Name'
          });

          // Initialize Controller
          CartsController = $controller('CartsController as vm', {
            $scope: $scope,
            cartResolve: mockCart
          });
        }));

        it('Should have the correct URL', function () {
          expect(viewstate.url).toEqual('/:cartId');
        });

        it('Should have a resolve function', function () {
          expect(typeof viewstate.resolve).toEqual('object');
          expect(typeof viewstate.resolve.cartResolve).toEqual('function');
        });

        it('should respond to URL', inject(function ($state) {
          expect($state.href(viewstate, {
            cartId: 1
          })).toEqual('/carts/1');
        }));

        it('should attach an Cart to the controller scope', function () {
          expect($scope.vm.cart._id).toBe(mockCart._id);
        });

        it('Should not be abstract', function () {
          expect(viewstate.abstract).toBe(undefined);
        });

        it('Should have templateUrl', function () {
          expect(viewstate.templateUrl).toBe('modules/carts/client/views/view-cart.client.view.html');
        });
      });

      describe('Create Route', function () {
        var createstate,
          CartsController,
          mockCart;

        beforeEach(inject(function ($controller, $state, $templateCache) {
          createstate = $state.get('carts.create');
          $templateCache.put('modules/carts/client/views/form-cart.client.view.html', '');

          // create mock Cart
          mockCart = new CartsService();

          // Initialize Controller
          CartsController = $controller('CartsController as vm', {
            $scope: $scope,
            cartResolve: mockCart
          });
        }));

        it('Should have the correct URL', function () {
          expect(createstate.url).toEqual('/create');
        });

        it('Should have a resolve function', function () {
          expect(typeof createstate.resolve).toEqual('object');
          expect(typeof createstate.resolve.cartResolve).toEqual('function');
        });

        it('should respond to URL', inject(function ($state) {
          expect($state.href(createstate)).toEqual('/carts/create');
        }));

        it('should attach an Cart to the controller scope', function () {
          expect($scope.vm.cart._id).toBe(mockCart._id);
          expect($scope.vm.cart._id).toBe(undefined);
        });

        it('Should not be abstract', function () {
          expect(createstate.abstract).toBe(undefined);
        });

        it('Should have templateUrl', function () {
          expect(createstate.templateUrl).toBe('modules/carts/client/views/form-cart.client.view.html');
        });
      });

      describe('Edit Route', function () {
        var editstate,
          CartsController,
          mockCart;

        beforeEach(inject(function ($controller, $state, $templateCache) {
          editstate = $state.get('carts.edit');
          $templateCache.put('modules/carts/client/views/form-cart.client.view.html', '');

          // create mock Cart
          mockCart = new CartsService({
            _id: '525a8422f6d0f87f0e407a33',
            name: 'Cart Name'
          });

          // Initialize Controller
          CartsController = $controller('CartsController as vm', {
            $scope: $scope,
            cartResolve: mockCart
          });
        }));

        it('Should have the correct URL', function () {
          expect(editstate.url).toEqual('/:cartId/edit');
        });

        it('Should have a resolve function', function () {
          expect(typeof editstate.resolve).toEqual('object');
          expect(typeof editstate.resolve.cartResolve).toEqual('function');
        });

        it('should respond to URL', inject(function ($state) {
          expect($state.href(editstate, {
            cartId: 1
          })).toEqual('/carts/1/edit');
        }));

        it('should attach an Cart to the controller scope', function () {
          expect($scope.vm.cart._id).toBe(mockCart._id);
        });

        it('Should not be abstract', function () {
          expect(editstate.abstract).toBe(undefined);
        });

        it('Should have templateUrl', function () {
          expect(editstate.templateUrl).toBe('modules/carts/client/views/form-cart.client.view.html');
        });

        xit('Should go to unauthorized route', function () {

        });
      });

    });
  });
}());
