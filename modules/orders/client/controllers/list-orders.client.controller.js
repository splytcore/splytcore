(function () {
  'use strict';

  angular
    .module('orders')
    .controller('OrdersListController', OrdersListController);

  OrdersListController.$inject = ['OrdersService', 'Authentication', '$state', '$cookies'];

  function OrdersListController(OrdersService, Authentication, $state, $cookies) {
    var vm = this;
    
    vm.user = Authentication.user

    vm.listType = $state.current.name
    vm.orders = OrdersService.query({ listType: vm.listType })
  
    vm.etherscanURL = $cookies.etherscanURL
  }
}());
