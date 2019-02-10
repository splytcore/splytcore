(function () {
  'use strict'

  angular
    .module('sellers')
    .controller('SellerOrdersController', SellerOrdersController)

  SellerOrdersController.$inject = ['OrdersService', '$state']

  function SellerOrdersController(OrdersService, $state) {
    var vm = this;

    vm.orders = OrdersService.query()
  }
}())
