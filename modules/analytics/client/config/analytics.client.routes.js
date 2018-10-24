(function () {
  'use strict';

  angular
    .module('analytics')
    .config(routeConfig);

  routeConfig.$inject = ['$stateProvider'];

  function routeConfig($stateProvider) {
    $stateProvider
      .state('analytics', {
        abstract: true,
        url: '/analytics',
        template: '<ui-view/>'
      })
      .state('analytics.list', {
        url: '',
        templateUrl: 'modules/analytics/client/views/list-analytics.client.view.html',
        controller: 'AnalyticsListController',
        controllerAs: 'vm',
        data: {
          pageTitle: 'Analytics List'
        }
      })
      .state('analytics.create', {
        url: '/create',
        templateUrl: 'modules/analytics/client/views/form-analytic.client.view.html',
        controller: 'AnalyticsController',
        controllerAs: 'vm',
        resolve: {
          analyticResolve: newAnalytic
        },
        data: {
          roles: ['user', 'admin'],
          pageTitle: 'Analytics Create'
        }
      })
      .state('analytics.edit', {
        url: '/:analyticId/edit',
        templateUrl: 'modules/analytics/client/views/form-analytic.client.view.html',
        controller: 'AnalyticsController',
        controllerAs: 'vm',
        resolve: {
          analyticResolve: getAnalytic
        },
        data: {
          roles: ['user', 'admin'],
          pageTitle: 'Edit Analytic {{ analyticResolve.name }}'
        }
      })
      .state('analytics.view', {
        url: '/:analyticId',
        templateUrl: 'modules/analytics/client/views/view-analytic.client.view.html',
        controller: 'AnalyticsController',
        controllerAs: 'vm',
        resolve: {
          analyticResolve: getAnalytic
        },
        data: {
          pageTitle: 'Analytic {{ analyticResolve.name }}'
        }
      });
  }

  getAnalytic.$inject = ['$stateParams', 'AnalyticsService'];

  function getAnalytic($stateParams, AnalyticsService) {
    return AnalyticsService.get({
      analyticId: $stateParams.analyticId
    }).$promise;
  }

  newAnalytic.$inject = ['AnalyticsService'];

  function newAnalytic(AnalyticsService) {
    return new AnalyticsService();
  }
}());
