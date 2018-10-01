(function () {
  'use strict';

  angular
    .module('reputations')
    .config(routeConfig);

  routeConfig.$inject = ['$stateProvider'];

  function routeConfig($stateProvider) {
    $stateProvider
      .state('reputations', {
        abstract: true,
        url: '/reputations',
        template: '<ui-view/>'
      })
      .state('reputations.list', {
        url: '',
        templateUrl: 'modules/reputations/client/views/list-reputations.client.view.html',
        controller: 'ReputationsListController',
        controllerAs: 'vm',
        data: {
          pageTitle: 'Reputations List'
        }
      })
      .state('reputations.listPending', {
        url: '/listPending',
        templateUrl: 'modules/reputations/client/views/pending.list-reputations.client.view.html',
        controller: 'ReputationsListController',
        controllerAs: 'vm',
        data: {
          pageTitle: 'Reputations List'
        }
      })   
      .state('reputations.listMyReputations', {
        url: '/myReputations',
        templateUrl: 'modules/reputations/client/views/list-reputations.client.view.html',
        controller: 'ReputationsListController',
        controllerAs: 'vm',
        data: {
          pageTitle: 'Reputations List'
        }
      })      
      .state('reputations.create', {
        url: '/create/:wallet/:title',
        templateUrl: 'modules/reputations/client/views/form-reputation.client.view.html',
        controller: 'ReputationsController',
        controllerAs: 'vm',
        resolve: {
          reputationResolve: newReputation
        },
        data: {
          roles: ['user', 'admin'],
          pageTitle: 'Reputations Create'
        }
      })
      .state('reputations.edit', {
        url: '/:reputationId/edit',
        templateUrl: 'modules/reputations/client/views/form-reputation.client.view.html',
        controller: 'ReputationsController',
        controllerAs: 'vm',
        resolve: {
          reputationResolve: getReputation
        },
        data: {
          roles: ['user', 'admin'],
          pageTitle: 'Edit Reputation {{ reputationResolve.name }}'
        }
      })
  }

  getReputation.$inject = ['$stateParams', 'ReputationsService'];

  function getReputation($stateParams, ReputationsService) {
    return ReputationsService.get({
      reputationId: $stateParams.reputationId
    }).$promise;
  }

  newReputation.$inject = ['ReputationsService'];

  function newReputation(ReputationsService) {
    return new ReputationsService();
  }
}());
