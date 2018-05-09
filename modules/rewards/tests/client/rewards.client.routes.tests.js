(function () {
  'use strict';

  describe('Rewards Route Tests', function () {
    // Initialize global variables
    var $scope,
      RewardsService;

    // We can start by loading the main application module
    beforeEach(module(ApplicationConfiguration.applicationModuleName));

    // The injector ignores leading and trailing underscores here (i.e. _$httpBackend_).
    // This allows us to inject a service but then attach it to a variable
    // with the same name as the service.
    beforeEach(inject(function ($rootScope, _RewardsService_) {
      // Set a new global scope
      $scope = $rootScope.$new();
      RewardsService = _RewardsService_;
    }));

    describe('Route Config', function () {
      describe('Main Route', function () {
        var mainstate;
        beforeEach(inject(function ($state) {
          mainstate = $state.get('rewards');
        }));

        it('Should have the correct URL', function () {
          expect(mainstate.url).toEqual('/rewards');
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
          RewardsController,
          mockReward;

        beforeEach(inject(function ($controller, $state, $templateCache) {
          viewstate = $state.get('rewards.view');
          $templateCache.put('modules/rewards/client/views/view-reward.client.view.html', '');

          // create mock Reward
          mockReward = new RewardsService({
            _id: '525a8422f6d0f87f0e407a33',
            name: 'Reward Name'
          });

          // Initialize Controller
          RewardsController = $controller('RewardsController as vm', {
            $scope: $scope,
            rewardResolve: mockReward
          });
        }));

        it('Should have the correct URL', function () {
          expect(viewstate.url).toEqual('/:rewardId');
        });

        it('Should have a resolve function', function () {
          expect(typeof viewstate.resolve).toEqual('object');
          expect(typeof viewstate.resolve.rewardResolve).toEqual('function');
        });

        it('should respond to URL', inject(function ($state) {
          expect($state.href(viewstate, {
            rewardId: 1
          })).toEqual('/rewards/1');
        }));

        it('should attach an Reward to the controller scope', function () {
          expect($scope.vm.reward._id).toBe(mockReward._id);
        });

        it('Should not be abstract', function () {
          expect(viewstate.abstract).toBe(undefined);
        });

        it('Should have templateUrl', function () {
          expect(viewstate.templateUrl).toBe('modules/rewards/client/views/view-reward.client.view.html');
        });
      });

      describe('Create Route', function () {
        var createstate,
          RewardsController,
          mockReward;

        beforeEach(inject(function ($controller, $state, $templateCache) {
          createstate = $state.get('rewards.create');
          $templateCache.put('modules/rewards/client/views/form-reward.client.view.html', '');

          // create mock Reward
          mockReward = new RewardsService();

          // Initialize Controller
          RewardsController = $controller('RewardsController as vm', {
            $scope: $scope,
            rewardResolve: mockReward
          });
        }));

        it('Should have the correct URL', function () {
          expect(createstate.url).toEqual('/create');
        });

        it('Should have a resolve function', function () {
          expect(typeof createstate.resolve).toEqual('object');
          expect(typeof createstate.resolve.rewardResolve).toEqual('function');
        });

        it('should respond to URL', inject(function ($state) {
          expect($state.href(createstate)).toEqual('/rewards/create');
        }));

        it('should attach an Reward to the controller scope', function () {
          expect($scope.vm.reward._id).toBe(mockReward._id);
          expect($scope.vm.reward._id).toBe(undefined);
        });

        it('Should not be abstract', function () {
          expect(createstate.abstract).toBe(undefined);
        });

        it('Should have templateUrl', function () {
          expect(createstate.templateUrl).toBe('modules/rewards/client/views/form-reward.client.view.html');
        });
      });

      describe('Edit Route', function () {
        var editstate,
          RewardsController,
          mockReward;

        beforeEach(inject(function ($controller, $state, $templateCache) {
          editstate = $state.get('rewards.edit');
          $templateCache.put('modules/rewards/client/views/form-reward.client.view.html', '');

          // create mock Reward
          mockReward = new RewardsService({
            _id: '525a8422f6d0f87f0e407a33',
            name: 'Reward Name'
          });

          // Initialize Controller
          RewardsController = $controller('RewardsController as vm', {
            $scope: $scope,
            rewardResolve: mockReward
          });
        }));

        it('Should have the correct URL', function () {
          expect(editstate.url).toEqual('/:rewardId/edit');
        });

        it('Should have a resolve function', function () {
          expect(typeof editstate.resolve).toEqual('object');
          expect(typeof editstate.resolve.rewardResolve).toEqual('function');
        });

        it('should respond to URL', inject(function ($state) {
          expect($state.href(editstate, {
            rewardId: 1
          })).toEqual('/rewards/1/edit');
        }));

        it('should attach an Reward to the controller scope', function () {
          expect($scope.vm.reward._id).toBe(mockReward._id);
        });

        it('Should not be abstract', function () {
          expect(editstate.abstract).toBe(undefined);
        });

        it('Should have templateUrl', function () {
          expect(editstate.templateUrl).toBe('modules/rewards/client/views/form-reward.client.view.html');
        });

        xit('Should go to unauthorized route', function () {

        });
      });

    });
  });
}());
