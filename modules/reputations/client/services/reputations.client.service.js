// Reputations service used to communicate Reputations REST endpoints
(function () {
  'use strict';

  angular
    .module('reputations')
    .factory('ReputationsService', ReputationsService);

  ReputationsService.$inject = ['$resource'];

  function ReputationsService($resource) {
    return $resource('api/reputations/:reputationId', {
      reputationId: '@_id'
    }, {
      update: {
        method: 'PUT'
      }
    });
  }
}());
