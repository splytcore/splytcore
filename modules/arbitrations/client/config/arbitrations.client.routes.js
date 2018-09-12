(function () {
  'use strict';

  angular
    .module('arbitrations')
    .config(routeConfig);

  routeConfig.$inject = ['$stateProvider'];

  function routeConfig($stateProvider) {
    $stateProvider
      .state('arbitrations', {
        abstract: true,
        url: '/arbitrations',
        template: '<ui-view/>'
      })
      .state('arbitrations.list', {
        url: '',
        templateUrl: 'modules/arbitrations/client/views/list-arbitrations.client.view.html',
        controller: 'ArbitrationsListController',
        controllerAs: 'vm',
        data: {
          pageTitle: 'Arbitrations List'
        }
      })
      .state('arbitrations.create', {
        url: '/create/:assetAddress/:title',
        templateUrl: 'modules/arbitrations/client/views/form-arbitration.client.view.html',
        controller: 'ArbitrationsController',
        controllerAs: 'vm',
        resolve: {
          arbitrationResolve: newArbitration
        },
        data: {
          roles: ['user', 'admin'],
          pageTitle: 'Arbitrations Create'
        }
      })
      .state('arbitrations.edit', {
        url: '/:arbitrationId/edit',
        templateUrl: 'modules/arbitrations/client/views/form-arbitration.client.view.html',
        controller: 'ArbitrationsController',
        controllerAs: 'vm',
        resolve: {
          arbitrationResolve: getArbitration
        },
        data: {
          roles: ['user', 'admin'],
          pageTitle: 'Edit Arbitration {{ arbitrationResolve.name }}'
        }
      })
      .state('arbitrations.view', {
        url: '/:arbitrationId',
        templateUrl: 'modules/arbitrations/client/views/view-arbitration.client.view.html',
        controller: 'ArbitrationsController',
        controllerAs: 'vm',
        resolve: {
          arbitrationResolve: getArbitration
        },
        data: {
          pageTitle: 'Arbitration {{ arbitrationResolve.name }}'
        }
      });
  }

  getArbitration.$inject = ['$stateParams', 'ArbitrationsService'];

  function getArbitration($stateParams, ArbitrationsService) {
    return ArbitrationsService.get({
      arbitrationId: $stateParams.arbitrationId
    }).$promise;
  }

  newArbitration.$inject = ['ArbitrationsService'];

  function newArbitration(ArbitrationsService) {
    return new ArbitrationsService();
  }
}());
