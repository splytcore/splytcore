(function () {
  'use strict';

  angular
    .module('dashboards')
    .config(routeConfig);

  routeConfig.$inject = ['$stateProvider'];

  function routeConfig($stateProvider) {
    $stateProvider
      .state('dashboards', {
        abstract: true,
        url: '/dashboards',
        template: '<ui-view/>'
      })

      .state('dashboards.seller.assets', {
        url: '/assets',
        templateUrl: 'modules/dashboards/client/views/seller-list-dashboards.client.view.html',
        controller: 'DashboardsSellerController',
        controllerAs: 'vm',
        roles: ['seller'],
        // resolve: {
        //   dashboardResolve: getDashboard
        // },
        // data: {
        //   pageTitle: 'Dashboard {{ dashboardResolve.name }}'
        // }
      })
      
      .state('dashboards.seller.orders', {
        url: '/orders',
        templateUrl: 'modules/dashboards/client/views/seller-dashboards.client.view.html',
        controller: 'DashboardsSellerController',
        controllerAs: 'vm',
        roles: ['seller'],
        // resolve: {
        //   dashboardResolve: getDashboard
        // },
        // data: {
        //   pageTitle: 'Dashboard {{ dashboardResolve.name }}'
        // }
      })

      .state('dashboards.seller', {
        url: '/seller',
        templateUrl: 'modules/dashboards/client/views/seller-dashboards.client.view.html',
        controller: 'DashboardsSellerController',
        controllerAs: 'vm',
        roles: ['seller'],
        // resolve: {
        //   dashboardResolve: getDashboard
        // },
        // data: {
        //   pageTitle: 'Dashboard {{ dashboardResolve.name }}'
        // }
      })

  }

  getDashboard.$inject = ['$stateParams', 'DashboardsService'];

  function getDashboard($stateParams, DashboardsService) {
    return DashboardsService.get({
      userId: $stateParams.userId
    }).$promise;
  }

  newDashboard.$inject = ['DashboardsService'];

  function newDashboard(DashboardsService) {
    return new DashboardsService();
  }
}());
