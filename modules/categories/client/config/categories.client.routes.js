(function () {
  'use strict';

  angular
    .module('categories')
    .config(routeConfig);

  routeConfig.$inject = ['$stateProvider'];

  function routeConfig($stateProvider) {
    $stateProvider
      .state('categories', {
        abstract: true,
        url: '/categories',
        template: '<ui-view/>'
      })
      .state('categories.list', {
        url: '',
        templateUrl: 'modules/categories/client/views/list-categories.client.view.html',
        controller: 'CategoriesListController',
        controllerAs: 'vm',
        data: {
          pageTitle: 'Categories List'
        }
      })
      .state('categories.create', {
        url: '/create',
        templateUrl: 'modules/categories/client/views/form-category.client.view.html',
        controller: 'CategoriesController',
        controllerAs: 'vm',
        resolve: {
          categoryResolve: newCategory
        },
        data: {
          roles: ['user', 'admin'],
          pageTitle: 'Categories Create'
        }
      })
      .state('categories.edit', {
        url: '/:categoryId/edit',
        templateUrl: 'modules/categories/client/views/form-category.client.view.html',
        controller: 'CategoriesController',
        controllerAs: 'vm',
        resolve: {
          categoryResolve: getCategory
        },
        data: {
          roles: ['user', 'admin'],
          pageTitle: 'Edit Category {{ categoryResolve.name }}'
        }
      })
      .state('categories.view', {
        url: '/:categoryId',
        templateUrl: 'modules/categories/client/views/view-category.client.view.html',
        controller: 'CategoriesController',
        controllerAs: 'vm',
        resolve: {
          categoryResolve: getCategory
        },
        data: {
          pageTitle: 'Category {{ categoryResolve.name }}'
        }
      });
  }

  getCategory.$inject = ['$stateParams', 'CategoriesService'];

  function getCategory($stateParams, CategoriesService) {
    return CategoriesService.get({
      categoryId: $stateParams.categoryId
    }).$promise;
  }

  newCategory.$inject = ['CategoriesService'];

  function newCategory(CategoriesService) {
    return new CategoriesService();
  }
}());
