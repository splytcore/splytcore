(function () {
  'use strict';

  // Assets controller
  angular
    .module('assets')
    .controller('AssetsController', AssetsController);

  AssetsController.$inject = ['$scope', '$state', '$window', 'Authentication', 'assetResolve', '$q', 'EthService', 'MarketsService', '$cookies'];

  function AssetsController ($scope, $state, $window, Authentication, asset, $q, EthService, MarketsService, $cookies) {
    var vm = this
    vm.save = save   
    vm.asset = asset
    vm.remove = remove
    vm.user = Authentication.user

    vm.addMarketPlace = addMarketPlace

    console.log('etherscanurl ' + $cookies.etherscanURL)
    
    vm.etherscanURL = $cookies.etherscanURL
    
    MarketsService.query((result) => {
      vm.marketPlaces = result
      vm.selectedMarketPlace = vm.asset._id ? '' : vm.marketPlaces[0].wallet
    })

    if (!vm.asset._id) {
          vm.asset.seller = vm.user.publicKey
          vm.defaultBuyer = vm.user.publicKey
          vm.asset.status = 0 
          vm.asset.inventoryCount = 1
          vm.asset.term = 0
          vm.asset.totalCost = 10000

    }



    function save(isValid) {
      if (!isValid) {
        $scope.$broadcast('show-errors-check-validity', 'vm.form.assetForm');
        return false;
      }

      //check if user has minimum requirements for ether and tokens
      console.log($cookies.etherBalance)
      console.log($cookies.tokenBalance)

      if (parseFloat($cookies.etherBalance) < .01 || parseInt($cookies.tokenBalance) < 1000) {
        alert('you do not have enough ethers or tokens')
        return false
      }


      console.log(vm.asset)
      // TODO: move create/update logic to service
      vm.asset.marketPlaces = [vm.selectedMarketPlace]

      console.log(vm.asset)

      if (vm.asset._id) {
        vm.asset.$update(successCallback, errorCallback);
      } else {
        vm.asset.$save(successCallback, errorCallback);
      }

      function successCallback(asset) {  
        console.log(asset.transactionHash)              
        $state.go('assets.listPending')
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

    function addMarketPlace() {
      EthService.addMarketPlace(vm.asset._id, vm.selectedMarketPlace)
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

  }
}());
