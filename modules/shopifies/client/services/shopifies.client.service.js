// Shopifies service used to communicate Shopifies REST endpoints
(function () {
  'use strict';

  angular
    .module('shopifies')
    .factory('ShopifiesService', ShopifiesService);

  ShopifiesService.$inject = ['$resource'];

  function ShopifiesService($resource) {
    return $resource('api/shopifies.angjs/:shopifyId', {
      shopifyId: '@_id'
    }, {
      update: {
        method: 'PUT'
      }
    });
  }
}());
