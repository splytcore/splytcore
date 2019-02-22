(function () {
  'use strict'

  angular
    .module('analytics')
    .config(routeConfig)

  routeConfig.$inject = ['$stateProvider']

  function routeConfig($stateProvider) {
    $stateProvider
      .state('analytics', {
        abstract: true,
        url: '/analytics',
        template: '<ui-view/>'
      })
      .state('analytics.summary', {
        url: '/generalSalesSummary',
        templateUrl: 'modules/analytics/client/views/summary-analytics.client.view.html',
        controller: 'AnalyticsSummaryController',
        controllerAs: 'vm',
        data: {
          roles: ['user', 'admin', 'affiliate', 'seller', 'customer'],
          pageTitle: 'Analytics Create'
        }
      })
  }

}())
