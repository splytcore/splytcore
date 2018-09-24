(function () {
  'use strict';

  describe('Markets Route Tests', function () {
    // Initialize global variables
    var $scope,
      MarketsService;

    // We can start by loading the main application module
    beforeEach(module(ApplicationConfiguration.applicationModuleName));

    // The injector ignores leading and trailing underscores here (i.e. _$httpBackend_).
    // This allows us to inject a service but then attach it to a variable
    // with the same name as the service.
    beforeEach(inject(function ($rootScope, _MarketsService_) {
      // Set a new global scope
      $scope = $rootScope.$new();
      MarketsService = _MarketsService_;
    }));

    describe('Route Config', function () {
      describe('Main Route', function () {
        var mainstate;
        beforeEach(inject(function ($state) {
          mainstate = $state.get('markets');
        }));

        it('Should have the correct URL', function () {
          expect(mainstate.url).toEqual('/markets');
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
          MarketsController,
          mockMarket;

        beforeEach(inject(function ($controller, $state, $templateCache) {
          viewstate = $state.get('markets.view');
          $templateCache.put('modules/markets/client/views/view-market.client.view.html', '');

          // create mock Market
          mockMarket = new MarketsService({
            _id: '525a8422f6d0f87f0e407a33',
            name: 'Market Name'
          });

          // Initialize Controller
          MarketsController = $controller('MarketsController as vm', {
            $scope: $scope,
            marketResolve: mockMarket
          });
        }));

        it('Should have the correct URL', function () {
          expect(viewstate.url).toEqual('/:marketId');
        });

        it('Should have a resolve function', function () {
          expect(typeof viewstate.resolve).toEqual('object');
          expect(typeof viewstate.resolve.marketResolve).toEqual('function');
        });

        it('should respond to URL', inject(function ($state) {
          expect($state.href(viewstate, {
            marketId: 1
          })).toEqual('/markets/1');
        }));

        it('should attach an Market to the controller scope', function () {
          expect($scope.vm.market._id).toBe(mockMarket._id);
        });

        it('Should not be abstract', function () {
          expect(viewstate.abstract).toBe(undefined);
        });

        it('Should have templateUrl', function () {
          expect(viewstate.templateUrl).toBe('modules/markets/client/views/view-market.client.view.html');
        });
      });

      describe('Create Route', function () {
        var createstate,
          MarketsController,
          mockMarket;

        beforeEach(inject(function ($controller, $state, $templateCache) {
          createstate = $state.get('markets.create');
          $templateCache.put('modules/markets/client/views/form-market.client.view.html', '');

          // create mock Market
          mockMarket = new MarketsService();

          // Initialize Controller
          MarketsController = $controller('MarketsController as vm', {
            $scope: $scope,
            marketResolve: mockMarket
          });
        }));

        it('Should have the correct URL', function () {
          expect(createstate.url).toEqual('/create');
        });

        it('Should have a resolve function', function () {
          expect(typeof createstate.resolve).toEqual('object');
          expect(typeof createstate.resolve.marketResolve).toEqual('function');
        });

        it('should respond to URL', inject(function ($state) {
          expect($state.href(createstate)).toEqual('/markets/create');
        }));

        it('should attach an Market to the controller scope', function () {
          expect($scope.vm.market._id).toBe(mockMarket._id);
          expect($scope.vm.market._id).toBe(undefined);
        });

        it('Should not be abstract', function () {
          expect(createstate.abstract).toBe(undefined);
        });

        it('Should have templateUrl', function () {
          expect(createstate.templateUrl).toBe('modules/markets/client/views/form-market.client.view.html');
        });
      });

      describe('Edit Route', function () {
        var editstate,
          MarketsController,
          mockMarket;

        beforeEach(inject(function ($controller, $state, $templateCache) {
          editstate = $state.get('markets.edit');
          $templateCache.put('modules/markets/client/views/form-market.client.view.html', '');

          // create mock Market
          mockMarket = new MarketsService({
            _id: '525a8422f6d0f87f0e407a33',
            name: 'Market Name'
          });

          // Initialize Controller
          MarketsController = $controller('MarketsController as vm', {
            $scope: $scope,
            marketResolve: mockMarket
          });
        }));

        it('Should have the correct URL', function () {
          expect(editstate.url).toEqual('/:marketId/edit');
        });

        it('Should have a resolve function', function () {
          expect(typeof editstate.resolve).toEqual('object');
          expect(typeof editstate.resolve.marketResolve).toEqual('function');
        });

        it('should respond to URL', inject(function ($state) {
          expect($state.href(editstate, {
            marketId: 1
          })).toEqual('/markets/1/edit');
        }));

        it('should attach an Market to the controller scope', function () {
          expect($scope.vm.market._id).toBe(mockMarket._id);
        });

        it('Should not be abstract', function () {
          expect(editstate.abstract).toBe(undefined);
        });

        it('Should have templateUrl', function () {
          expect(editstate.templateUrl).toBe('modules/markets/client/views/form-market.client.view.html');
        });

        xit('Should go to unauthorized route', function () {

        });
      });

    });
  });
}());
