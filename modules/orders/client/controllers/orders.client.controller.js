(function () {
  'use strict';

  // Orders controller
  angular
    .module('orders')
    .controller('OrdersController', OrdersController);

  OrdersController.$inject = ['$scope', '$state', '$window', 'Authentication', 'orderResolve', '$stateParams', 'EthService'];

  function OrdersController ($scope, $state, $window, Authentication, order, $stateParams, EthService) {
    var vm = this;
    console.log($stateParams)
    vm.authentication = Authentication;
    vm.order = order;
    vm.error = null;
    vm.form = {};
    vm.remove = remove;
    vm.save = save;

    if (!vm.order._id) {
      EthService.getDefaultWallets()
        .success((wallets) => {
          console.log(wallets)
          order.buyerWallet = wallets.defaultBuyer
          order.assetAddress = $stateParams.assetAddress
          order.trxAmount = $stateParams.trxAmount   
          order.quantity = 1
          order.status = 0
        })
        .error((err) => {
          console.log(err)
        })

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
        $state.go('orders.view', {
          orderId: res._id
        });
      }

      function errorCallback(res) {
        vm.error = res.data.message;
      }
    }
  }
}());
