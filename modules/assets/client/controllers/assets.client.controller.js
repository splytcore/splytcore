(function () {
  'use strict';

  // Assets controller
  angular
    .module('assets')
    .controller('AssetsController', AssetsController);

  AssetsController.$inject = ['$scope', '$state', '$window', 'Authentication', 'assetResolve', '$q', 'EthService'];

  function AssetsController ($scope, $state, $window, Authentication, asset, $q, EthService) {
    var vm = this
    vm.purchase = purchase
    vm.save = save   
    vm.asset = asset
    vm.remove = remove

    vm.myWallets = EthService.getMyWallets();

    console.log('buyer wallet: ' + vm.myWallets)
    vm.asset.sellerWallet = !vm.asset._id ? vm.myWallets[0] : 'not found';
   

    EthService.getAddressByAssetId(vm.asset._id, (err, address) => {
      console.log('returned address: ' + address)
      asset.address = address 
      console.log(vm.asset)
      $scope.$apply()
    })

    EthService.getAssetInfo(vm.asset._id, (err, fields) => {
      console.log('returned fields: ' + fields)
      $scope.$apply()
    })

    vm.assetStatus = EthService.getAssetStatus(vm.asset._id);
    console.log('status fields: ' + vm.assetStatus)

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

    function remove() {
      if ($window.confirm('Are you sure you want to delete?')) {
        vm.asset.$remove($state.go('assets.list'));
      }
    }    
  }
}());
