(function () {
  'use strict';

  // Assets controller
  angular
    .module('assets')
    .controller('AssetsController', AssetsController);

  AssetsController.$inject = ['$scope', '$state', '$window', 'Authentication', 'assetResolve', '$q', 'EthService', 'orderResolve', 'arbitrationResolve'];

  function AssetsController ($scope, $state, $window, Authentication, asset, $q, EthService, order, arbitration) {
    var vm = this
    vm.purchase = purchase
    vm.save = save   
    vm.asset = asset
    vm.remove = remove
    vm.arbitration = arbitration

    vm.initArbitration = initArbitration

    // if (!vm.asset._id) {
      EthService.getDefaultWallets()
        .success((wallets) => {
          console.log(wallets)
          vm.asset.seller = wallets.defaultSeller
          vm.marketPlaces = []
          vm.marketPlaces.push(wallets.defaultMarketPlace)
          vm.defaultBuyer = wallets.defaultBuyer
          vm.asset.marketPlaces = vm.marketPlaces
          vm.asset.status = 0
        })
        .error((err) => {
          console.log(err)
        })
    // }


    // vm.getTokenBalance = EthService.getTokenBalance();


    // console.log('buyer wallet: ' + vm.myWallets)
    // vm.asset.seller = !vm.asset._id ? vm.myWallets[0] : 'not found';
   
    // if (vm.asset._id) {
    //   EthService.getAddressByAssetId(vm.asset._id, (err, address) => {
    //     console.log('returned address: ' + address)
    //     asset.address = address 
    //     console.log(vm.asset)
    //     $scope.$apply()
    //   })

    //   EthService.getAssetInfo(vm.asset._id, (err, fields) => {
    //     console.log('returned fields: ' + fields)
    //     $scope.$apply()
    //   })
  
    //   vm.assetStatus = EthService.getAssetStatus(vm.asset._id);
    //   console.log('status fields: ' + vm.assetStatus)

    // }

    
    function initArbitration() {

      if (!vm.asset._id) {
        return false;      
      }

      vm.arbitration.asset = vm.asset
      vm.arbitration.$save(
        (res) => {
          console.log('succesffl arbitration')
          console.log(res._id)
          // EthService.purchase(res._id, vm.asset._id)
        },
        (err) => {
          console.log(err)
        }
      )
    }

    function purchase() {

      if (!vm.asset._id) {
        return false;      
      }

      order.asset = vm.asset
      order.totalAmount = vm.asset.totalCost
      order.assetAddress = vm.asset.address
      order.buyerWallet = vm.defaultBuyer
      order.quantity = 1
      order.$save(
        (res) => {
          console.log('succesffl purchase')
          console.log(res._id)
          // EthService.purchase(res._id, vm.asset._id)
        },
        (err) => {
          console.log(err)
        }
      )
    }

    function save(isValid) {
      if (!isValid) {
        $scope.$broadcast('show-errors-check-validity', 'vm.form.assetForm');
        return false;
      }

      // TODO: move create/update logic to service
      if (vm.asset._id) {
        vm.asset.$update(successCallback, errorCallback);
      } else {
        vm.asset.$save(successCallback, errorCallback);
      }

      function successCallback(asset) {                
          //EthService.createAsset(asset); //if you want to use metamask. Currently using backend to interact with contracts
      }

      function errorCallback(res) {
        vm.error = res.data.message;
      }
    }

    function remove() {
      if ($window.confirm('Are you sure you want to delete?')) {
        vm.asset.$remove($state.go('assets.list'));
      }
    }    
  }
}());
