// Orders service used to communicate Orders REST endpoints
(function () {
  'use strict';

  angular
    .module('orders')
    .factory('OrdersService', OrdersService);

  OrdersService.$inject = ['$resource'];

  function OrdersService($resource) {
    return $resource('api/orders/:orderId', {
      orderId: '@_id'
    }, {
      update: {
        method: 'PUT'
      }
    });
  }
}());
