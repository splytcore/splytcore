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
      .state('carts.create', {
        url: '/create',
        templateUrl: 'modules/carts/client/views/form-cart.client.view.html',
        controller: 'CartsController',
        controllerAs: 'vm',
        resolve: {
          cartResolve: newCart
        },
        data: {
          roles: ['user', 'admin', 'seller', 'affiliate', 'customer'],
          pageTitle: 'Carts Create'
        }
      })
      .state('carts.edit', {
        url: '/:cartId/edit',
        templateUrl: 'modules/carts/client/views/form-cart.client.view.html',
        controller: 'CartsController',
        controllerAs: 'vm',
        resolve: {
          cartResolve: getCart
        },
        data: {
          roles: ['user', 'admin', 'affiliate', 'customer', 'seller'],
          pageTitle: 'Edit Cart {{ cartResolve.name }}'
        }
      })
      .state('carts.view', {
        url: '/:cartId',
        templateUrl: 'modules/carts/client/views/view-cart.client.view.html',
        controller: 'CartsController',
        controllerAs: 'vm',
        resolve: {
          cartResolve: getCart
        },
        data: {
          pageTitle: 'Cart {{ cartResolve.name }}'
        }
      });
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
