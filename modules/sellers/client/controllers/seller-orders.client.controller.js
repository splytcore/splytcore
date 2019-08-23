(function () {
  'use strict';

  angular
    .module('sellers')
    .controller('SellerOrdersController', SellerOrdersController);

  SellerOrdersController.$inject = ['OrdersService', '$state'];

  function SellerOrdersController(OrdersService, $tate) {
    var vm = this;

    vm.orders = OrdersService.query({listType: 'ORDERS.LISTBYASSETID', assetId: $state.params.assetId });
  }
}())
