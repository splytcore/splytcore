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
        templateUrl: 'modules/affiliates/client/views/stores.client.view.html',
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
      .state('affiliates.categories', {
        url: '/categories',
        templateUrl: 'modules/affiliates/client/views/categories.client.view.html',
        controller: 'AffiliatesCategoryController',
        controllerAs: 'vm',
        // resolve: {
        //   affiliateResolve: newAffiliate
        // },
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
}());
