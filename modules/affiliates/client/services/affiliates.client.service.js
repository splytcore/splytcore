// Affiliates service used to communicate Affiliates REST endpoints
(function () {
  'use strict';

  angular
    .module('affiliates')
    .factory('AffiliatesService', AffiliatesService);

  AffiliatesService.$inject = ['$resource'];

  function AffiliatesService($resource) {
    return $resource('api/affiliates/:affiliateId', {
      affiliateId: '@_id'
    }, {
      update: {
        method: 'PUT'
      }
    });
  }
}());
