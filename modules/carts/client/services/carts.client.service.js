// Carts service used to communicate Carts REST endpoints
(function () {
  'use strict';

  angular
    .module('carts')
    .factory('CartsService', CartsService);

  CartsService.$inject = ['$resource'];

  function CartsService($resource) {
    return $resource('api/carts/:cartId', {
      cartId: '@_id'
    }, {
      update: {
        method: 'PUT'
      }
    });
  }
}());
