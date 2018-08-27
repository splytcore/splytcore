(function () {
  'use strict';

  angular
    .module('orders')
    .controller('OrdersListController', OrdersListController);

  OrdersListController.$inject = ['OrdersService'];

  function OrdersListController(OrdersService) {
    var vm = this;

    vm.orders = OrdersService.query();
  }
}());
