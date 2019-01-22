// Stripes service used to communicate Stripes REST endpoints
(function () {
  'use strict';

  angular
    .module('stripes')
    .factory('StripesService', StripesService);

  StripesService.$inject = ['$resource'];

  function StripesService($resource) {
    return $resource('api/stripes/:stripeId', {
      stripeId: '@_id'
    }, {
      update: {
        method: 'PUT'
      }
    });
  }
}());
