(function () {
  'use strict';

  angular
    .module('markets')
    .config(routeConfig);

  routeConfig.$inject = ['$stateProvider'];

  function routeConfig($stateProvider) {
    $stateProvider
      .state('markets', {
        abstract: true,
        url: '/markets',
        template: '<ui-view/>'
      })
      .state('markets.list', {
        url: '',
        templateUrl: 'modules/markets/client/views/list-markets.client.view.html',
        controller: 'MarketsListController',
        controllerAs: 'vm',
        data: {
          pageTitle: 'Markets List'
        }
      })
      .state('markets.create', {
        url: '/create',
        templateUrl: 'modules/markets/client/views/form-market.client.view.html',
        controller: 'MarketsController',
        controllerAs: 'vm',
        resolve: {
          marketResolve: newMarket
        },
        data: {
          roles: ['user', 'admin'],
          pageTitle: 'Markets Create'
        }
      })
      .state('markets.edit', {
        url: '/:marketId/edit',
        templateUrl: 'modules/markets/client/views/form-market.client.view.html',
        controller: 'MarketsController',
        controllerAs: 'vm',
        resolve: {
          marketResolve: getMarket
        },
        data: {
          roles: ['user', 'admin'],
          pageTitle: 'Edit Market {{ marketResolve.name }}'
        }
      })
      .state('markets.view', {
        url: '/:marketId',
        templateUrl: 'modules/markets/client/views/view-market.client.view.html',
        controller: 'MarketsController',
        controllerAs: 'vm',
        resolve: {
          marketResolve: getMarket
        },
        data: {
          pageTitle: 'Market {{ marketResolve.name }}'
        }
      });
  }

  getMarket.$inject = ['$stateParams', 'MarketsService'];

  function getMarket($stateParams, MarketsService) {
    return MarketsService.get({
      marketId: $stateParams.marketId
    }).$promise;
  }

  newMarket.$inject = ['MarketsService'];

  function newMarket(MarketsService) {
    return new MarketsService();
  }
}());
