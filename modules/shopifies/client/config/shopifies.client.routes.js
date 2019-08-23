(function () {
  'use strict';

  angular
    .module('shopifies')
    .config(routeConfig);

  routeConfig.$inject = ['$stateProvider'];

  function routeConfig($stateProvider) {
    $stateProvider
      .state('shopifies', {
        abstract: true,
        url: '/shopifies',
        template: '<ui-view/>'
      })
      .state('shopifies.list', {
        url: '',
        templateUrl: 'modules/shopifies/client/views/list-shopifies.client.view.html',
        controller: 'ShopifiesListController',
        controllerAs: 'vm',
        data: {
          pageTitle: 'Shopifies List'
        }
      })
      .state('shopifies.create', {
        url: '/create',
        templateUrl: 'modules/shopifies/client/views/form-shopify.client.view.html',
        controller: 'ShopifiesController',
        controllerAs: 'vm',
        resolve: {
          shopifyResolve: newShopify
        },
        data: {
          roles: ['user', 'admin'],
          pageTitle: 'Shopifies Create'
        }
      })
      .state('shopifies.edit', {
        url: '/:shopifyId/edit',
        templateUrl: 'modules/shopifies/client/views/form-shopify.client.view.html',
        controller: 'ShopifiesController',
        controllerAs: 'vm',
        resolve: {
          shopifyResolve: getShopify
        },
        data: {
          roles: ['user', 'admin'],
          pageTitle: 'Edit Shopify {{ shopifyResolve.name }}'
        }
      })
      .state('shopifies.view', {
        url: '/:shopifyId',
        templateUrl: 'modules/shopifies/client/views/view-shopify.client.view.html',
        controller: 'ShopifiesController',
        controllerAs: 'vm',
        resolve: {
          shopifyResolve: getShopify
        },
        data: {
          pageTitle: 'Shopify {{ shopifyResolve.name }}'
        }
      });
  }

  getShopify.$inject = ['$stateParams', 'ShopifiesService'];

  function getShopify($stateParams, ShopifiesService) {
    return ShopifiesService.get({
      shopifyId: $stateParams.shopifyId
    }).$promise;
  }

  newShopify.$inject = ['ShopifiesService'];

  function newShopify(ShopifiesService) {
    return new ShopifiesService();
  }
}());
