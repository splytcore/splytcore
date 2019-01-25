(function () {
  'use strict';

  angular
    .module('sellers')
    .config(routeConfig);

  routeConfig.$inject = ['$stateProvider'];

  function routeConfig($stateProvider) {
    $stateProvider
      .state('sellers', {
        abstract: true,
        url: '/sellers',
        template: '<ui-view/>'
      })
      .state('sellers.dashboard', {
        url: '/dashboard',
        templateUrl: 'modules/sellers/client/views/dashboard.client.view.html',
        controller: 'SellersController',
        controllerAs: 'vm',
        // resolve: {
        //   assetResolve: newAsset
        // },
        data: {
          roles: ['seller', 'admin'],
          pageTitle: 'Sellers Create'
        }
      })
      .state('sellers.ordersByAssetId', {
        url: '/orders/:assetId',
        templateUrl: 'modules/sellers/client/views/seller-orders.client.view.html',
        controller: 'SellerOrdersController',
        controllerAs: 'vm',
        // resolve: {
        //   sellerResolve: newSeller
        // },
        data: {
          roles: ['seller', 'admin'],
          pageTitle: 'Sellers Create'
        }
      })
      .state('sellers.assets', {
        url: '/assets',
        templateUrl: 'modules/sellers/client/views/seller-assets.client.view.html',
        controller: 'SellerAssetsController',
        controllerAs: 'vm',
        // resolve: {
        //   sellerResolve: newSeller
        // },
        data: {
          roles: ['seller', 'admin'],
          pageTitle: 'Sellers Create'
        }
      })
  }

  // getAssets.$inject = ['$stateParams', 'SellersService'];

  // function getAssets($stateParams, SellersService) {
  //   return SellersService.get({
  //     assetId: $stateParams.sellerId
  //   }).$promise;
  // }

  // newAsset.$inject = ['SellersService'];

  // function newAsset(SellersService) {
  //   return new SellersService();
  // }
}());
