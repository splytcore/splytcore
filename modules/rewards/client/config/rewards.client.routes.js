(function () {
  'use strict';

  angular
    .module('rewards')
    .config(routeConfig);

  routeConfig.$inject = ['$stateProvider'];

  function routeConfig($stateProvider) {
    $stateProvider
      .state('rewards', {
        abstract: true,
        url: '/rewards',
        template: '<ui-view/>'
      })
      .state('rewards.list', {
        url: '',
        templateUrl: 'modules/rewards/client/views/list-rewards.client.view.html',
        controller: 'RewardsListController',
        controllerAs: 'vm',
        data: {
          pageTitle: 'Rewards List'
        }
      })
      .state('rewards.create', {
        url: '/create',
        templateUrl: 'modules/rewards/client/views/form-reward.client.view.html',
        controller: 'RewardsController',
        controllerAs: 'vm',
        resolve: {
          rewardResolve: newReward
        },
        data: {
          roles: ['user', 'admin'],
          pageTitle: 'Rewards Create'
        }
      })
      .state('rewards.edit', {
        url: '/:rewardId/edit',
        templateUrl: 'modules/rewards/client/views/form-reward.client.view.html',
        controller: 'RewardsController',
        controllerAs: 'vm',
        resolve: {
          rewardResolve: getReward
        },
        data: {
          roles: ['user', 'admin'],
          pageTitle: 'Edit Reward {{ rewardResolve.name }}'
        }
      })
      .state('rewards.view', {
        url: '/:rewardId',
        templateUrl: 'modules/rewards/client/views/view-reward.client.view.html',
        controller: 'RewardsController',
        controllerAs: 'vm',
        resolve: {
          rewardResolve: getReward
        },
        data: {
          pageTitle: 'Reward {{ rewardResolve.name }}'
        }
      });
  }

  getReward.$inject = ['$stateParams', 'RewardsService'];

  function getReward($stateParams, RewardsService) {
    return RewardsService.get({
      rewardId: $stateParams.rewardId
    }).$promise;
  }

  newReward.$inject = ['RewardsService'];

  function newReward(RewardsService) {
    return new RewardsService();
  }
}());
