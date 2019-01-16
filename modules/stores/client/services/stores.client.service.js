// Stores service used to communicate Stores REST endpoints
(function () {
  'use strict';

  angular
    .module('stores')
    .factory('StoresService', StoresService);

  StoresService.$inject = ['$resource'];

  function StoresService($resource) {
    return $resource('api/stores/:storeId', {
      storeId: '@_id'
    }, {
      update: {
        method: 'PUT'
      }
    });
  }
}());
