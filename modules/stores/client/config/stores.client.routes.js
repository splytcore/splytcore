(function () {
  'use strict';

  angular
    .module('stores')
    .config(routeConfig);

  routeConfig.$inject = ['$stateProvider'];

  function routeConfig($stateProvider) {
    $stateProvider
      .state('stores', {
        abstract: true,
        url: '/stores',
        template: '<ui-view/>'
      })
      .state('stores.list', {
        url: '',
        templateUrl: 'modules/stores/client/views/list-stores.client.view.html',
        controller: 'StoresListController',
        controllerAs: 'vm',
        data: {
          pageTitle: 'Stores List'
        }
      })
      .state('stores.create', {
        url: '/create',
        templateUrl: 'modules/stores/client/views/form-store.client.view.html',
        controller: 'StoresController',
        controllerAs: 'vm',
        resolve: {
          storeResolve: newStore
        },
        data: {
          roles: ['user', 'admin', 'affiliate'],
          pageTitle: 'Stores Create'
        }
      })
      .state('stores.edit', {
        url: '/:storeId/edit',
        templateUrl: 'modules/stores/client/views/form-store.client.view.html',
        controller: 'StoresController',
        controllerAs: 'vm',
        resolve: {
          storeResolve: getStore
        },
        data: {
          roles: ['user', 'admin' ,'affiliate'],
          pageTitle: 'Edit Store {{ storeResolve.name }}'
        }
      })
      .state('stores.view', {
        url: '/:storeId',
        templateUrl: 'modules/stores/client/views/view-store.client.view.html',
        controller: 'StoresController',
        controllerAs: 'vm',
        resolve: {
          storeResolve: getStore
        },
        data: {
          pageTitle: 'Store {{ storeResolve.name }}'
        }
      })    
  }

  getStore.$inject = ['$stateParams', 'StoresService'];

  function getStore($stateParams, StoresService) {
    return StoresService.get({
      storeId: $stateParams.storeId
    }).$promise;
  }

  newStore.$inject = ['StoresService'];

  function newStore(StoresService) {
    return new StoresService();
  }
}());
