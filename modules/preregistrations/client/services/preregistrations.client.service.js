// Preregistrations service used to communicate Preregistrations REST endpoints
(function () {
  'use strict';

  angular
    .module('preregistrations')
    .factory('PreregistrationsService', PreregistrationsService);

  PreregistrationsService.$inject = ['$resource'];

  function PreregistrationsService($resource) {
    return $resource('api/preregistrations/:preregistrationId', {
      preregistrationId: '@_id'
    }, {
      update: {
        method: 'PUT'
      }
    });
  }
}());
