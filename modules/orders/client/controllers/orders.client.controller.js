(function () {
  'use strict';

  // Orders controller
  angular
    .module('orders')
    .controller('OrdersController', OrdersController);

  OrdersController.$inject = ['$scope', '$state', '$window', 'Authentication', 'orderResolve', '$stateParams', 'EthService', '$cookies'];

  function OrdersController ($scope, $state, $window, Authentication, order, $stateParams, EthService, $cookies) {
    var vm = this
    // console.log($stateParams)
    vm.user = Authentication.user
    vm.order = order
    vm.error = null
    vm.form = {}
    vm.remove = remove
    vm.save = save
    vm.updateTrxAmount = updateTrxAmount

    vm.etherscanURL = $cookies.etherscanURL
    
    vm.requestRefund = requestRefund
    vm.approveRefund = approveRefund


    //TODO: save actions in config file
    vm.actions = [ 
      { id: 1,name: 'Request Refund(You must be the buyer)'},
      { id: 2,name: 'Approve Refund(You must be seller)'}
    ]

    function requestRefund() {

      EthService.requestRefund(vm.order._id)
        .success((result) => {
          console.log(result)
          alert(result)
          // $window.location.reload();          
        })
        .error((err) => {
          console.log(err)
          vm.error = err.message          
        })

    }


    function approveRefund() {

      EthService.approveRefund(vm.order._id)
        .success((result) => {
          console.log(result)
          alert(result)
          // $window.location.reload();          
        })
        .error((err) => {
          console.log(err)
        })

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

      if (parseInt($stateParams.status) != 1) {
        alert('Asset must be in status 1 to purchase')
        return false
      }

      vm.order.marketPlace = vm.selectedMarketPlace

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
