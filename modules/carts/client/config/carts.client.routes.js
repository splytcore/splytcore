(function () {
  'use strict';

  angular
    .module('carts')
    .config(routeConfig);

  routeConfig.$inject = ['$stateProvider'];

  function routeConfig($stateProvider) {
    $stateProvider
      .state('carts', {
        abstract: true,
        url: '/carts',
        template: '<ui-view/>'
      })
      .state('carts.list', {
        url: '',
        templateUrl: 'modules/carts/client/views/list-carts.client.view.html',
        controller: 'CartsListController',
        controllerAs: 'vm',
        data: {
          pageTitle: 'Carts List'
        }
      })
      .state('carts.view', {
        url: '/:cartId/view',
        templateUrl: 'modules/carts/client/views/view-cart.client.view.html',
        controller: 'CartsController',
        controllerAs: 'vm',
        data: {
          pageTitle: 'Carts List'
        },
        resolve: {
          cartResolve: getCart
        }          
      })

  }

  getCart.$inject = ['$stateParams', 'CartsService'];

  function getCart($stateParams, CartsService) {
    return CartsService.get({
      cartId: $stateParams.cartId
    }).$promise;
  }

  newCart.$inject = ['CartsService'];

  function newCart(CartsService) {
    return new CartsService();
  }
}());
