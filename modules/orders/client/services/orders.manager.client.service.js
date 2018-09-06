// Orders service used to communicate Orders REST endpoints
(function () {
  'use strict';

  angular
    .module('orders')
    .factory('OrdersManagerService', OrdersManagerService);

  OrdersManagerService.$inject = ['$http'];

  function OrdersManagerService($http) {
    let vm = this
    vm.create = create
    vm.baseURL = '/api/orders/'

    function create(assetId) {
      return $http.get(baseURL)
    }

  }
}());
