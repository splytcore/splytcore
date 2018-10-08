(function () {
  'use strict';

  // Orders controller
  angular
    .module('orders')
    .controller('OrdersController', OrdersController);

  OrdersController.$inject = ['$scope', '$state', '$window', 'Authentication', 'orderResolve', '$stateParams', 'EthService', '$cookies'];

  function OrdersController ($scope, $state, $window, Authentication, order, $stateParams, EthService, $cookies) {
    var vm = this;
    console.log($stateParams)
    vm.user = Authentication.user;
    vm.order = order;
    vm.error = null;
    vm.form = {};
    vm.remove = remove;
    vm.save = save;

    vm.updateTrxAmount = updateTrxAmount;

    vm.etherscanURL = $cookies.etherscanURL
    

    if (!vm.order._id) {
        vm.order.buyerWallet = vm.user.publicKey
        vm.order.assetAddress = $stateParams.assetAddress
        vm.order.trxAmount = $stateParams.trxAmount   
        vm.order.quantity = 1
        vm.order.status = 0
    }


    // Remove existing Order
    function updateTrxAmount() {
      vm.order.trxAmount = $stateParams.trxAmount * vm.order.quantity
    }

    // Remove existing Order
    function remove() {
      if ($window.confirm('Are you sure you want to delete?')) {
        vm.order.$remove($state.go('orders.list'));
      }
    }

    // Save Order
    function save(isValid) {
      if (!isValid) {
        $scope.$broadcast('show-errors-check-validity', 'vm.form.orderForm');
        return false;
      }

      // TODO: move create/update logic to service
      if (vm.order._id) {
        vm.order.$update(successCallback, errorCallback);
      } else {
        vm.order.$save(successCallback, errorCallback);
      }

      function successCallback(res) {
        $state.go('orders.listPending')
      }

      function errorCallback(res) {
        vm.error = res.data.message
      }
    }
  }
}());
