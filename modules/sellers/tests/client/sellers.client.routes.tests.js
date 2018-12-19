(function () {
  'use strict';

  describe('Sellers Route Tests', function () {
    // Initialize global variables
    var $scope,
      SellersService;

    // We can start by loading the main application module
    beforeEach(module(ApplicationConfiguration.applicationModuleName));

    // The injector ignores leading and trailing underscores here (i.e. _$httpBackend_).
    // This allows us to inject a service but then attach it to a variable
    // with the same name as the service.
    beforeEach(inject(function ($rootScope, _SellersService_) {
      // Set a new global scope
      $scope = $rootScope.$new();
      SellersService = _SellersService_;
    }));

    describe('Route Config', function () {
      describe('Main Route', function () {
        var mainstate;
        beforeEach(inject(function ($state) {
          mainstate = $state.get('sellers');
        }));

        it('Should have the correct URL', function () {
          expect(mainstate.url).toEqual('/sellers');
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
          SellersController,
          mockSeller;

        beforeEach(inject(function ($controller, $state, $templateCache) {
          viewstate = $state.get('sellers.view');
          $templateCache.put('modules/sellers/client/views/view-seller.client.view.html', '');

          // create mock Seller
          mockSeller = new SellersService({
            _id: '525a8422f6d0f87f0e407a33',
            name: 'Seller Name'
          });

          // Initialize Controller
          SellersController = $controller('SellersController as vm', {
            $scope: $scope,
            sellerResolve: mockSeller
          });
        }));

        it('Should have the correct URL', function () {
          expect(viewstate.url).toEqual('/:sellerId');
        });

        it('Should have a resolve function', function () {
          expect(typeof viewstate.resolve).toEqual('object');
          expect(typeof viewstate.resolve.sellerResolve).toEqual('function');
        });

        it('should respond to URL', inject(function ($state) {
          expect($state.href(viewstate, {
            sellerId: 1
          })).toEqual('/sellers/1');
        }));

        it('should attach an Seller to the controller scope', function () {
          expect($scope.vm.seller._id).toBe(mockSeller._id);
        });

        it('Should not be abstract', function () {
          expect(viewstate.abstract).toBe(undefined);
        });

        it('Should have templateUrl', function () {
          expect(viewstate.templateUrl).toBe('modules/sellers/client/views/view-seller.client.view.html');
        });
      });

      describe('Create Route', function () {
        var createstate,
          SellersController,
          mockSeller;

        beforeEach(inject(function ($controller, $state, $templateCache) {
          createstate = $state.get('sellers.create');
          $templateCache.put('modules/sellers/client/views/form-seller.client.view.html', '');

          // create mock Seller
          mockSeller = new SellersService();

          // Initialize Controller
          SellersController = $controller('SellersController as vm', {
            $scope: $scope,
            sellerResolve: mockSeller
          });
        }));

        it('Should have the correct URL', function () {
          expect(createstate.url).toEqual('/create');
        });

        it('Should have a resolve function', function () {
          expect(typeof createstate.resolve).toEqual('object');
          expect(typeof createstate.resolve.sellerResolve).toEqual('function');
        });

        it('should respond to URL', inject(function ($state) {
          expect($state.href(createstate)).toEqual('/sellers/create');
        }));

        it('should attach an Seller to the controller scope', function () {
          expect($scope.vm.seller._id).toBe(mockSeller._id);
          expect($scope.vm.seller._id).toBe(undefined);
        });

        it('Should not be abstract', function () {
          expect(createstate.abstract).toBe(undefined);
        });

        it('Should have templateUrl', function () {
          expect(createstate.templateUrl).toBe('modules/sellers/client/views/form-seller.client.view.html');
        });
      });

      describe('Edit Route', function () {
        var editstate,
          SellersController,
          mockSeller;

        beforeEach(inject(function ($controller, $state, $templateCache) {
          editstate = $state.get('sellers.edit');
          $templateCache.put('modules/sellers/client/views/form-seller.client.view.html', '');

          // create mock Seller
          mockSeller = new SellersService({
            _id: '525a8422f6d0f87f0e407a33',
            name: 'Seller Name'
          });

          // Initialize Controller
          SellersController = $controller('SellersController as vm', {
            $scope: $scope,
            sellerResolve: mockSeller
          });
        }));

        it('Should have the correct URL', function () {
          expect(editstate.url).toEqual('/:sellerId/edit');
        });

        it('Should have a resolve function', function () {
          expect(typeof editstate.resolve).toEqual('object');
          expect(typeof editstate.resolve.sellerResolve).toEqual('function');
        });

        it('should respond to URL', inject(function ($state) {
          expect($state.href(editstate, {
            sellerId: 1
          })).toEqual('/sellers/1/edit');
        }));

        it('should attach an Seller to the controller scope', function () {
          expect($scope.vm.seller._id).toBe(mockSeller._id);
        });

        it('Should not be abstract', function () {
          expect(editstate.abstract).toBe(undefined);
        });

        it('Should have templateUrl', function () {
          expect(editstate.templateUrl).toBe('modules/sellers/client/views/form-seller.client.view.html');
        });

        xit('Should go to unauthorized route', function () {

        });
      });

    });
  });
}());
