// Arbitrations service used to communicate Arbitrations REST endpoints
(function () {
  'use strict';

  angular
    .module('arbitrations')
    .factory('ArbitrationsService', ArbitrationsService);

  ArbitrationsService.$inject = ['$resource'];

  function ArbitrationsService($resource) {
    return $resource('api/arbitrations/:arbitrationId', {
      arbitrationId: '@_id',
    }, {
      update: {
        method: 'PUT'
      }
    });
  }
}());
