// Markets service used to communicate Markets REST endpoints
(function () {
  'use strict';

  angular
    .module('markets')
    .factory('MarketsService', MarketsService);

  MarketsService.$inject = ['$resource'];

  function MarketsService($resource) {
    return $resource('api/markets/:marketId', {
      marketId: '@_id'
    }, {
      update: {
        method: 'PUT'
      }
    });
  }
}());
