(function () {
  'use strict';

  // Assets controller
  angular
    .module('assets')
    .controller('AssetsController', AssetsController);

  AssetsController.$inject = ['$scope', '$state', '$window', 'Authentication', 'AssetsService', '$q', 'EthService'];

  function AssetsController ($scope, $state, $window, Authentication, AssetsService, $q, EthService) {
    var vm = this
    vm.purchase = purchase
    vm.save = save   
    
    if ($state.params.assetId) {
      AssetsService.get($state.params.assetId)
        .success((res) => {             
          vm.asset = res    
          EthService.getAddressByAssetId(res._id, (err, address) => {
            vm.asset.address = address
            $scope.$apply()
          })
        })
        .error((res) => {          
          console.log(res)
        })        
    } else {
      vm.asset = {}
    }

    vm.myWallets = EthService.getMyWallets();

    console.log('buyer wallet: ' + vm.myWallets)
    // vm.asset.sellerWallet = vm.asset ? 'not found' : vm.myWallets[0]
   
    // EthService.getAddressByAssetId(vm.asset._id, (err, address) => {
    //   console.log('returned address: ' + address)
    //   asset.address = address 
    //   console.log(vm.asset)

    // })

    function purchase() {

      EthService.purchase(vm.asset._id)

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
          EthService.createAsset(asset);
      }

      function errorCallback(res) {
        vm.error = res.data.message;
      }
    }
  }
}());
