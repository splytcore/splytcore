(function () {
  'use strict';

  describe('Affiliates Route Tests', function () {
    // Initialize global variables
    var $scope,
      AffiliatesService;

    // We can start by loading the main application module
    beforeEach(module(ApplicationConfiguration.applicationModuleName));

    // The injector ignores leading and trailing underscores here (i.e. _$httpBackend_).
    // This allows us to inject a service but then attach it to a variable
    // with the same name as the service.
    beforeEach(inject(function ($rootScope, _AffiliatesService_) {
      // Set a new global scope
      $scope = $rootScope.$new();
      AffiliatesService = _AffiliatesService_;
    }));

    describe('Route Config', function () {
      describe('Main Route', function () {
        var mainstate;
        beforeEach(inject(function ($state) {
          mainstate = $state.get('affiliates');
        }));

        it('Should have the correct URL', function () {
          expect(mainstate.url).toEqual('/affiliates');
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
          AffiliatesController,
          mockAffiliate;

        beforeEach(inject(function ($controller, $state, $templateCache) {
          viewstate = $state.get('affiliates.view');
          $templateCache.put('modules/affiliates/client/views/view-affiliate.client.view.html', '');

          // create mock Affiliate
          mockAffiliate = new AffiliatesService({
            _id: '525a8422f6d0f87f0e407a33',
            name: 'Affiliate Name'
          });

          // Initialize Controller
          AffiliatesController = $controller('AffiliatesController as vm', {
            $scope: $scope,
            affiliateResolve: mockAffiliate
          });
        }));

        it('Should have the correct URL', function () {
          expect(viewstate.url).toEqual('/:affiliateId');
        });

        it('Should have a resolve function', function () {
          expect(typeof viewstate.resolve).toEqual('object');
          expect(typeof viewstate.resolve.affiliateResolve).toEqual('function');
        });

        it('should respond to URL', inject(function ($state) {
          expect($state.href(viewstate, {
            affiliateId: 1
          })).toEqual('/affiliates/1');
        }));

        it('should attach an Affiliate to the controller scope', function () {
          expect($scope.vm.affiliate._id).toBe(mockAffiliate._id);
        });

        it('Should not be abstract', function () {
          expect(viewstate.abstract).toBe(undefined);
        });

        it('Should have templateUrl', function () {
          expect(viewstate.templateUrl).toBe('modules/affiliates/client/views/view-affiliate.client.view.html');
        });
      });

      describe('Create Route', function () {
        var createstate,
          AffiliatesController,
          mockAffiliate;

        beforeEach(inject(function ($controller, $state, $templateCache) {
          createstate = $state.get('affiliates.create');
          $templateCache.put('modules/affiliates/client/views/form-affiliate.client.view.html', '');

          // create mock Affiliate
          mockAffiliate = new AffiliatesService();

          // Initialize Controller
          AffiliatesController = $controller('AffiliatesController as vm', {
            $scope: $scope,
            affiliateResolve: mockAffiliate
          });
        }));

        it('Should have the correct URL', function () {
          expect(createstate.url).toEqual('/create');
        });

        it('Should have a resolve function', function () {
          expect(typeof createstate.resolve).toEqual('object');
          expect(typeof createstate.resolve.affiliateResolve).toEqual('function');
        });

        it('should respond to URL', inject(function ($state) {
          expect($state.href(createstate)).toEqual('/affiliates/create');
        }));

        it('should attach an Affiliate to the controller scope', function () {
          expect($scope.vm.affiliate._id).toBe(mockAffiliate._id);
          expect($scope.vm.affiliate._id).toBe(undefined);
        });

        it('Should not be abstract', function () {
          expect(createstate.abstract).toBe(undefined);
        });

        it('Should have templateUrl', function () {
          expect(createstate.templateUrl).toBe('modules/affiliates/client/views/form-affiliate.client.view.html');
        });
      });

      describe('Edit Route', function () {
        var editstate,
          AffiliatesController,
          mockAffiliate;

        beforeEach(inject(function ($controller, $state, $templateCache) {
          editstate = $state.get('affiliates.edit');
          $templateCache.put('modules/affiliates/client/views/form-affiliate.client.view.html', '');

          // create mock Affiliate
          mockAffiliate = new AffiliatesService({
            _id: '525a8422f6d0f87f0e407a33',
            name: 'Affiliate Name'
          });

          // Initialize Controller
          AffiliatesController = $controller('AffiliatesController as vm', {
            $scope: $scope,
            affiliateResolve: mockAffiliate
          });
        }));

        it('Should have the correct URL', function () {
          expect(editstate.url).toEqual('/:affiliateId/edit');
        });

        it('Should have a resolve function', function () {
          expect(typeof editstate.resolve).toEqual('object');
          expect(typeof editstate.resolve.affiliateResolve).toEqual('function');
        });

        it('should respond to URL', inject(function ($state) {
          expect($state.href(editstate, {
            affiliateId: 1
          })).toEqual('/affiliates/1/edit');
        }));

        it('should attach an Affiliate to the controller scope', function () {
          expect($scope.vm.affiliate._id).toBe(mockAffiliate._id);
        });

        it('Should not be abstract', function () {
          expect(editstate.abstract).toBe(undefined);
        });

        it('Should have templateUrl', function () {
          expect(editstate.templateUrl).toBe('modules/affiliates/client/views/form-affiliate.client.view.html');
        });

        xit('Should go to unauthorized route', function () {

        });
      });

    });
  });
}());
