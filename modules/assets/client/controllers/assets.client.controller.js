(function () {
  'use strict';

  // Assets controller
  angular
    .module('assets')
    .controller('AssetsController', AssetsController);

  AssetsController.$inject = ['$scope', '$state', '$window', 'Authentication', 'assetResolve', '$q', 'EthService'];

  function AssetsController ($scope, $state, $window, Authentication, asset, $q, EthService) {
    var vm = this;
    vm.purchase = purchase;
    vm.save = save;    
    vm.asset = asset;

    vm.myWallets = EthService.getMyWallets();

    console.log('buyer wallet: ' + vm.myWallets)
    // Save Asset


    vm.asset.sellerWallet = !vm.asset._id ? vm.myWallets[0] : 'not found';
      
    function purchase() {

      EthService.purchase(vm.asset._id);

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
