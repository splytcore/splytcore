(function () {
  'use strict';

  describe('Orders Route Tests', function () {
    // Initialize global variables
    var $scope,
      OrdersService;

    // We can start by loading the main application module
    beforeEach(module(ApplicationConfiguration.applicationModuleName));

    // The injector ignores leading and trailing underscores here (i.e. _$httpBackend_).
    // This allows us to inject a service but then attach it to a variable
    // with the same name as the service.
    beforeEach(inject(function ($rootScope, _OrdersService_) {
      // Set a new global scope
      $scope = $rootScope.$new();
      OrdersService = _OrdersService_;
    }));

    describe('Route Config', function () {
      describe('Main Route', function () {
        var mainstate;
        beforeEach(inject(function ($state) {
          mainstate = $state.get('orders');
        }));

        it('Should have the correct URL', function () {
          expect(mainstate.url).toEqual('/orders');
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
          OrdersController,
          mockOrder;

        beforeEach(inject(function ($controller, $state, $templateCache) {
          viewstate = $state.get('orders.view');
          $templateCache.put('modules/orders/client/views/view-order.client.view.html', '');

          // create mock Order
          mockOrder = new OrdersService({
            _id: '525a8422f6d0f87f0e407a33',
            name: 'Order Name'
          });

          // Initialize Controller
          OrdersController = $controller('OrdersController as vm', {
            $scope: $scope,
            orderResolve: mockOrder
          });
        }));

        it('Should have the correct URL', function () {
          expect(viewstate.url).toEqual('/:orderId');
        });

        it('Should have a resolve function', function () {
          expect(typeof viewstate.resolve).toEqual('object');
          expect(typeof viewstate.resolve.orderResolve).toEqual('function');
        });

        it('should respond to URL', inject(function ($state) {
          expect($state.href(viewstate, {
            orderId: 1
          })).toEqual('/orders/1');
        }));

        it('should attach an Order to the controller scope', function () {
          expect($scope.vm.order._id).toBe(mockOrder._id);
        });

        it('Should not be abstract', function () {
          expect(viewstate.abstract).toBe(undefined);
        });

        it('Should have templateUrl', function () {
          expect(viewstate.templateUrl).toBe('modules/orders/client/views/view-order.client.view.html');
        });
      });

      describe('Create Route', function () {
        var createstate,
          OrdersController,
          mockOrder;

        beforeEach(inject(function ($controller, $state, $templateCache) {
          createstate = $state.get('orders.create');
          $templateCache.put('modules/orders/client/views/form-order.client.view.html', '');

          // create mock Order
          mockOrder = new OrdersService();

          // Initialize Controller
          OrdersController = $controller('OrdersController as vm', {
            $scope: $scope,
            orderResolve: mockOrder
          });
        }));

        it('Should have the correct URL', function () {
          expect(createstate.url).toEqual('/create');
        });

        it('Should have a resolve function', function () {
          expect(typeof createstate.resolve).toEqual('object');
          expect(typeof createstate.resolve.orderResolve).toEqual('function');
        });

        it('should respond to URL', inject(function ($state) {
          expect($state.href(createstate)).toEqual('/orders/create');
        }));

        it('should attach an Order to the controller scope', function () {
          expect($scope.vm.order._id).toBe(mockOrder._id);
          expect($scope.vm.order._id).toBe(undefined);
        });

        it('Should not be abstract', function () {
          expect(createstate.abstract).toBe(undefined);
        });

        it('Should have templateUrl', function () {
          expect(createstate.templateUrl).toBe('modules/orders/client/views/form-order.client.view.html');
        });
      });

      describe('Edit Route', function () {
        var editstate,
          OrdersController,
          mockOrder;

        beforeEach(inject(function ($controller, $state, $templateCache) {
          editstate = $state.get('orders.edit');
          $templateCache.put('modules/orders/client/views/form-order.client.view.html', '');

          // create mock Order
          mockOrder = new OrdersService({
            _id: '525a8422f6d0f87f0e407a33',
            name: 'Order Name'
          });

          // Initialize Controller
          OrdersController = $controller('OrdersController as vm', {
            $scope: $scope,
            orderResolve: mockOrder
          });
        }));

        it('Should have the correct URL', function () {
          expect(editstate.url).toEqual('/:orderId/edit');
        });

        it('Should have a resolve function', function () {
          expect(typeof editstate.resolve).toEqual('object');
          expect(typeof editstate.resolve.orderResolve).toEqual('function');
        });

        it('should respond to URL', inject(function ($state) {
          expect($state.href(editstate, {
            orderId: 1
          })).toEqual('/orders/1/edit');
        }));

        it('should attach an Order to the controller scope', function () {
          expect($scope.vm.order._id).toBe(mockOrder._id);
        });

        it('Should not be abstract', function () {
          expect(editstate.abstract).toBe(undefined);
        });

        it('Should have templateUrl', function () {
          expect(editstate.templateUrl).toBe('modules/orders/client/views/form-order.client.view.html');
        });

        xit('Should go to unauthorized route', function () {

        });
      });

    });
  });
}());
