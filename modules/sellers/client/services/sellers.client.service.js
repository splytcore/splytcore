// Sellers service used to communicate Sellers REST endpoints
(function () {
  'use strict';

  angular
    .module('sellers')
    .factory('SellersService', SellersService);

  SellersService.$inject = ['$resource'];

  function SellersService($resource) {
    return $resource('api/sellers/:sellerId', {
      sellerId: '@_id'
    }, {
      update: {
        method: 'PUT'
      }
    });
  }
}());
