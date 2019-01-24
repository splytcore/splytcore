(function () {
  'use strict';

  angular
    .module('carts')
    .config(routeConfig);

  routeConfig.$inject = ['$stateProvider'];

  function routeConfig($stateProvider) {
    $stateProvider
      .state('cart', {
        abstract: true,
        url: '/cart',
        template: '<ui-view/>'
      })
      .state('cart.checkout', {
        url: '',
        templateUrl: 'modules/carts/client/views/checkout.client.view.html',
        controller: 'CheckoutController',
        controllerAs: 'vm',
        // resolve: {
        //   cartResolve: getCart
        // },
        data: {
          // roles: ['user', 'admin', 'affiliate', 'customer', 'seller'],
          pageTitle: 'Edit Cart {{ cartResolve.name }}'
        }
      })
      // .stat      
      // .state('carts.checkout', {
      //   url: '/:cartId',
      //   templateUrl: 'modules/carts/client/views/view-cart.client.view.html',
      //   controller: 'CartsController',
      //   controllerAs: 'vm',
      //   resolve: {
      //     cartResolve: getCart
      //   },
      //   data: {
      //     pageTitle: 'Cart {{ cartResolve.name }}'
      //   }
      // });
  }

}());
