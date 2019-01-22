// Carts service used to communicate Carts REST endpoints
(function () {
  'use strict';

  angular
    .module('carts')
    .factory('CartsItemsService', CartsItemsService);

  CartsItemsService.$inject = ['$resource'];

  function CartsItemsService($resource) {
    return $resource('api/cartsitems/:itemId', {
      cartId: '@_id'
    }, {
      update: {
        method: 'PUT'
      }
    });
  }
}());
