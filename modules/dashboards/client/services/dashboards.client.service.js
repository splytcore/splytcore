// Dashboards service used to communicate Dashboards REST endpoints
(function () {
  'use strict';

  angular
    .module('dashboards')
    .factory('DashboardsService', DashboardsService);

  DashboardsService.$inject = ['$resource'];

  function DashboardsService($resource) {
    return $resource('api/dashboards/:dashboardId', {
      dashboardId: '@_id'
    }, {
      update: {
        method: 'PUT'
      }
    });
  }
}());
