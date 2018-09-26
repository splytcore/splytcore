(function () {
  'use strict';

  angular
    .module('orders')
    .controller('OrdersListController', OrdersListController);

  OrdersListController.$inject = ['OrdersService', 'Authentication', '$state'];

  function OrdersListController(OrdersService, Authentication, $state) {
    var vm = this;
    
    vm.user = Authentication.user

    vm.wallet = $state.current.name.indexOf('orders.listMyOrders') > -1 ? vm.user.publicKey : null

    vm.listPending = $state.current.name.indexOf('orders.listPending') > -1 ? true : false

    vm.orders = OrdersService.query({ wallet: vm.wallet, listPending: vm.listPending })
  
  }
}());
