(function () {
  'use strict';

  angular
    .module('assets')
    .config(routeConfig);

  routeConfig.$inject = ['$stateProvider'];

  function routeConfig($stateProvider) {
    $stateProvider
      .state('assets', {
        abstract: true,
        url: '/assets',
        template: '<ui-view/>'
      })

      .state('assets.list', {
        url: '',
        templateUrl: 'modules/assets/client/views/list-assets.client.view.html',
        controller: 'AssetsListController',
        controllerAs: 'vm',
        data: {
          pageTitle: 'assets List'
        }
      })
      .state('assets.create', {
        url: '/create',
        templateUrl: 'modules/assets/client/views/form-asset.client.view.html',
        controller: 'AssetsController',
        controllerAs: 'vm',
        resolve: {
          assetResolve: newAsset
        },
        data: {
          roles: ['user', 'admin', 'seller'],
          pageTitle: 'assets Create'
        }
      })
      .state('assets.view', {
        url: '/:assetId',
        templateUrl: 'modules/assets/client/views/view-asset.client.view.html',
        controller: 'AssetsController',
        controllerAs: 'vm',
        resolve: {
          assetResolve: getAsset
        },
        data: {
          // roles: ['user', 'admin', 'seller', 'customer', 'affiliate'],
          pageTitle: 'Asset{{ assetResolve.name }}'
        }
      })
      .state('assets.edit', {
        url: '/:assetId/edit',
        templateUrl: 'modules/assets/client/views/form-asset.client.view.html',
        controller: 'AssetsController',
        controllerAs: 'vm',
        resolve: {
          assetResolve: getAsset
        },        
        data: {
          roles: ['user', 'admin', 'seller', 'buyer', 'affiliate', 'customer'],
          pageTitle: 'Edit Asset {{ assetResolve.name }}'
        }
      })

  }

  getAsset.$inject = ['$stateParams', 'AssetsService'];

  function getAsset($stateParams, AssetsService) {
    return AssetsService.get({
      assetId: $stateParams.assetId
    }).$promise;
  }

  newAsset.$inject = ['AssetsService'];

  function newAsset(AssetsService) {
    return new AssetsService();
  }


}());
