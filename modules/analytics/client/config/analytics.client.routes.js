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
      .state('analytics.affiliates', {
        url: '/affiliates',
        templateUrl: 'modules/analytics/client/views/affiliates-analytics.client.view.html',
        controller: 'AnalyticsAffiliatesController',
        controllerAs: 'vm',
        data: {
          roles: ['user', 'admin'],
          pageTitle: 'Affiliates Analytics'
        }
      })
      .state('analytics.affiliatesView', {
        url: '/affiliates/:affiliateId',
        templateUrl: 'modules/analytics/client/views/detail-affiliates-analytics.client.view.html',
        controller: 'AnalyticsAffiliatesController',
        controllerAs: 'vm',
        data: {
          roles: ['user', 'admin'],
          pageTitle: 'Affiliates Analytics'
        }
      })      
      .state('analytics.summary', {
        url: '/generalSalesSummary',
        templateUrl: 'modules/analytics/client/views/summary-analytics.client.view.html',
        controller: 'AnalyticsSummaryController',
        controllerAs: 'vm',
        data: {
          roles: ['user', 'admin'],
          pageTitle: 'Analytics Create'
        }
      })
  }

}())
