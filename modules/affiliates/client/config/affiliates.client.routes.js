(function () {
  'use strict';

  angular
    .module('affiliates')
    .config(routeConfig);

  routeConfig.$inject = ['$stateProvider'];

  function routeConfig($stateProvider) {
    $stateProvider
      .state('affiliates', {
        abstract: true,
        url: '/affiliates',
        template: '<ui-view/>'
      })
      .state('affiliates.dashboard', {
        url: '/dashboard',
        templateUrl: 'modules/affiliates/client/views/dashboard.client.view.html',
        controller: 'AffiliatesController',
        controllerAs: 'vm',
        // resolve: {
        //   affiliateResolve: newAffiliate
        // },
        data: {
          roles: ['affiliate', 'admin'],
          pageTitle: 'Affiliates Create'
        }
      })
      .state('affiliates.stores', {
        url: '/stores',
        templateUrl: 'modules/affiliates/client/views/stores-affiliate.client.view.html',
        controller: 'AffiliatesStoreController',
        controllerAs: 'vm',
        // resolve: {
        //   affiliateResolve: newAffiliate
        // },
        data: {
          roles: ['affiliate', 'admin'],
          pageTitle: 'Affiliates Category Create'
        }
      })         
      .state('affiliates.storesEdit', {
        url: '/stores/:storeId',
        templateUrl: 'modules/affiliates/client/views/assets-affiliate.client.view.html',
        controller: 'AffiliatesAssetsController',
        controllerAs: 'vm',
        resolve: {
          storeResolve: getStore
        },
        data: {
          roles: ['affiliate', 'admin'],
          pageTitle: 'Affiliates Category Create'
        }
      })      
  }

  getAffiliate.$inject = ['$stateParams', 'AffiliatesService'];

  function getAffiliate($stateParams, AffiliatesService) {
    return AffiliatesService.get({
      affiliateId: $stateParams.affiliateId
    }).$promise;
  }

  newAffiliate.$inject = ['AffiliatesService'];

  function newAffiliate(AffiliatesService) {
    return new AffiliatesService();
  }


  getStore.$inject = ['$stateParams', 'StoresService'];

  function getStore($stateParams, StoresService) {
    return StoresService.get({
      storeId: $stateParams.storeId
    }).$promise;
  }

}());
