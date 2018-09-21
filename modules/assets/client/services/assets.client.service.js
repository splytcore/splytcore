// Rewards service used to communicate Rewards REST endpoints
(function () {
  'use strict';

  angular
    .module('assets')
    .factory('AssetsService', AssetsService);

  AssetsService.$inject = ['$resource'];

  function AssetsService($resource) {
    return $resource('api/assets/:assetId', {
      assetId: '@_id'
    }, {
      update: {
        method: 'PUT'
      }
      // ,
      // query: {
      //   method: 'GET',
      //   params: { scotts: name },
      //   isArray: true
      // }    
    })


  }
}());
