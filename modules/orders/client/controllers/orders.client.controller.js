(function () {
  'use strict';

  // Orders controller
  angular
    .module('orders')
    .controller('OrdersController', OrdersController);

  OrdersController.$inject = ['$scope', '$state', '$window', 'Authentication', 'orderResolve', '$stateParams', 'EthService', '$cookies', 'AssetsManagerService'];

  function OrdersController ($scope, $state, $window, Authentication, order, $stateParams, EthService, $cookies, AssetsManagerService) {
    var vm = this
    // console.log($stateParams)
    vm.user = Authentication.user
    vm.order = order
    vm.error = null
    vm.form = {}
    vm.remove = remove
    vm.save = save
    vm.applyAction = applyAction

    vm.updateTrxAmount = updateTrxAmount

    vm.etherscanURL = $cookies.etherscanURL
    
    vm.requestRefund = requestRefund
    vm.approveRefund = approveRefund
    vm.applyAction = applyAction

    //TODO: save actions in config file
    vm.actions = [ 
      { id: 1,name: 'Request Refund(You must be the buyer)'},
      { id: 2,name: 'Approve Refund(You must be seller)'}
    ]


    vm.totalContributions = 0
    if (!vm.order._id) {
        vm.order.buyerWallet = vm.user.publicKey
        vm.order.assetAddress = $stateParams.assetAddress
        vm.order.trxAmount = $stateParams.trxAmount   
        vm.order.quantity = 1
        vm.order.status = 0
    } else {
      AssetsManagerService.getAssetByAddress(vm.order.assetAddress)
      .then((result) => {
        vm.asset = result.data
        console.log(vm.asset)
      })

      if (vm.order.contributions.length > 0) {
        vm.totalContributions = 0
        vm.order.contributions.forEach((c) => {
          vm.totalContributions += parseInt(c.amount)
        })
      }
    }


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
    
    function applyAction() {
      console.log(vm.selectedAction)
      switch(parseInt(vm.selectedAction)) {
          case 1:
              requestRefund()              
              break;
          case 2:
              approveRefund()              
              break;        
          default:
              alert('NOT VALID SELECTION')
              break;
      } 
      EthService.updateUserBalances()     
    }   

  }
}());
