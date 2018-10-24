// Analytics service used to communicate Analytics REST endpoints
(function () {
  'use strict';

  angular
    .module('analytics')
    .factory('AnalyticsService', AnalyticsService);

  AnalyticsService.$inject = ['$resource'];

  function AnalyticsService($resource) {
    return $resource('api/analytics/:analyticId', {
      analyticId: '@_id'
    }, {
      update: {
        method: 'PUT'
      }
    });
  }
}());
