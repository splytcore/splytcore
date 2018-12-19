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
        //   sellerResolve: newSeller
        // },
        data: {
          roles: ['seller', 'admin'],
          pageTitle: 'Sellers Create'
        }
      })
  }

  // getSeller.$inject = ['$stateParams', 'SellersService'];

  // function getSeller($stateParams, SellersService) {
  //   return SellersService.get({
  //     sellerId: $stateParams.sellerId
  //   }).$promise;
  // }

  // newSeller.$inject = ['SellersService'];

  // function newSeller(SellersService) {
  //   return new SellersService();
  // }
}());
