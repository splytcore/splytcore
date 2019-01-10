(function () {
  'use strict';

  angular
    .module('sellers')
    .controller('SellerOrdersController', SellerOrdersController);

  SellerOrdersController.$inject = ['OrdersService'];

  function SellersListController(OrdersService) {
    var vm = this;

    vm.orders = OrdersService.query({listType: 'ORDERS.LISTBYASSETID'});
  }
}())
