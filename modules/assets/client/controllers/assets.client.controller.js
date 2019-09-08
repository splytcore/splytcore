(function () {
  'use strict';

  // Assets controller
  angular
    .module('assets')
    .controller('AssetsController', AssetsController);

  AssetsController.$inject = ['$scope', '$state', '$window', 'Authentication', 'assetResolve', '$q', 'EthService', 'MarketsService', '$cookies', '$filter'];

  function AssetsController ($scope, $state, $window, Authentication, asset, $q, EthService, MarketsService, $cookies, $filter) {
    var vm = this
    vm.save = save   
    vm.asset = asset
    vm.remove = remove
    vm.user = Authentication.user

    vm.addMarketPlace = addMarketPlace
    vm.applyAction = applyAction

    console.log('etherscanurl ' + $cookies.etherscanURL)
    
    vm.etherscanURL = $cookies.etherscanURL
    
    //TODO: save it default config file
    vm.actions = [ 
      // { id: 1,name: 'Add Market Place'},
      { id: 2,name: 'Buy'},
      { id: 3,name: 'Start Arbitration'},
      { id: 4,name: 'Rate Buyer'},
      { id: 5,name: 'Rate Seller'}
    ]

   
    switch(vm.asset.status) {
      case "0": 
        vm.asset.statusName = 'Not Mined'
        break
      case "1": 
        vm.asset.statusName = 'Active'
        break
      case "2": 
        vm.asset.statusName = 'In Arbitration'
        break
      case "3": 
        vm.asset.statusName =  'Expired'
        break
      case "4": 
        vm.asset.statusName =  'Sold Out'
        break
      case "5": 
        vm.asset.statusName =  'Closed'
        break
      case "6": 
        vm.asset.statusName =  'Other'
        break
    }
    switch(vm.asset.type) {
      case "0": 
        vm.asset.typeName = 'Single'
        break
      case "1": 
        vm.asset.typeName = 'Fractional'
        break
    }

    vm.selectedAction = 1

    MarketsService.query((result) => {
      vm.marketPlaces = result
      vm.selectedMarketPlace = vm.asset._id && result.length > 0 ? '' : vm.asset.marketPlaces[0].wallet
    })

    if (!vm.asset._id) {
          vm.asset.seller = vm.user.publicKey
          vm.defaultBuyer = vm.user.publicKey
          vm.asset.status = 0 
          vm.asset.inventoryCount = 1
          vm.asset.term = 0
          vm.asset.totalCost = 10000

    } else {
      // vm.actions = $filter('filter')(vm.actions, filterByStatus)
      // vm.actions = $filter('filter')(vm.actions, { id: [2,3] })
      vm.actions = $filter('AssetActionsFilter')(vm.actions, vm.asset.status)

    }


    function save(isValid) {
      if (!isValid) {
        $scope.$broadcast('show-errors-check-validity', 'vm.form.assetForm');
        return false;
      }

      //check if user has minimum requirements for ether and tokens
      console.log(vm.user.etherBalance)
      console.log(vm.user.tokenBalance)

      if (parseFloat(vm.user.etherBalance) < .01 || parseInt(vm.user.tokenBalance) < 1000) {
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
        EthService.updateUserBalances()
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


    function applyAction() {
      console.log(vm.selectedAction)
      switch(parseInt(vm.selectedAction)) {
          case 2:
              $state.go('orders.create', { assetAddress: vm.asset.address, title: vm.asset.title, trxAmount: vm.asset.totalCost, status: vm.asset.status })              
              break;
          case 3:
              $state.go('arbitrations.create', { assetAddress: vm.asset.address, title: vm.asset.title })
              break;
          case 4:
              $state.go('reputations.create', { wallet: vm.asset.seller, title: vm.asset.title })
              break;          
          case 5:
              $state.go('reputations.create', { wallet: vm.asset.address, title: vm.asset.title })
              break;              
          default:
      }      

    }   

  }
}());
