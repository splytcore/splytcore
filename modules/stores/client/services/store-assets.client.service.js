// Stores service used to communicate Stores REST endpoints
(function () {
  'use strict';

  angular
    .module('stores')
    .factory('StoreAssetsService', StoreAssetsService);

  StoreAssetsService.$inject = ['$resource'];

  function StoreAssetsService($resource) {
    return $resource('api/storeassets/:storeAssetId', {
      storeAssetId: '@_id'
    }, {
      update: {
        method: 'PUT'
      }
    });
  }
}());
