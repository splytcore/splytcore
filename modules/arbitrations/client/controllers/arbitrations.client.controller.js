(function () {
  'use strict';

  // Arbitrations controller
  angular
    .module('arbitrations')
    .controller('ArbitrationsController', ArbitrationsController);

  ArbitrationsController.$inject = ['$scope', '$state', '$window', 'Authentication', 'arbitrationResolve', '$stateParams', 'EthService', 'ArbitraitionsManagerService', '$cookies'];

  function ArbitrationsController ($scope, $state, $window, Authentication, arbitration, $stateParams, EthService, ArbitraitionsManagerService, $cookies) {
    
    console.log($stateParams)

    var vm = this;
    console.log(arbitration)
    vm.title = $stateParams.title

    vm.user = Authentication.user;
    vm.arbitration = arbitration;
    vm.error = null;
    vm.form = {};
    vm.remove = remove;
    vm.save = save;

    vm.applyAction = applyAction
    vm.setArbitrator = setArbitrator
    vm.set2xStakeByReporter = set2xStakeByReporter
    vm.set2xStakeBySeller = set2xStakeBySeller
    vm.setWinner = setWinner


    vm.etherscanURL = $cookies.etherscanURL

    //TODO: save actions in config file
    vm.actions = [ 
      { id: 1,name: 'Set2x Stake By Seller(You must be the seller)'},
      { id: 2,name: 'Set2x Stake by Reporter(You must be original reporter)'},
      { id: 3,name: 'Set Arbitrator as yourself'},
      { id: 4,name: 'Set Winner'}
    ]


    if (!arbitration._id) {
        arbitration.reporterWallet = vm.user.publicKey
        arbitration.reason = 0
        arbitration.assetAddress = $stateParams.assetAddress
  }
    // Remove existing Arbitration
    function remove() {
      if ($window.confirm('Are you sure you want to delete?')) {
        vm.arbitration.$remove($state.go('arbitrations.list'));
      }
    }

    // Set arbitrater
    function setArbitrator() {
      ArbitraitionsManagerService.setArbitrator(vm.arbitration._id)
        .success((result) => {
          alert(result)
          console.log('success update')
        })
        .error((err) => {
          vm.error = err.message
        })
    }

    function setWinner() {
      ArbitraitionsManagerService.setWinner(vm.arbitration._id, vm.arbitration.winner)
        .success((result) => {
          alert(result)
          console.log('success update')
        })
        .error((err) => {
          console.log(err)
          vm.error = err.message
        })
    }

    function set2xStakeByReporter() {
      ArbitraitionsManagerService.set2xStakeByReporter(vm.arbitration._id)
        .success((result) => {
          alert(result)
          console.log('success update')
        })
        .error((err) => {
          console.log(err)
        })
    }

    function set2xStakeBySeller() {
      console.log('this being called?')
      ArbitraitionsManagerService.set2xStakeBySeller(vm.arbitration._id)
        .success((result) => {
          alert(result)
          console.log('success update')
        })
        .error((err) => {
          console.log(err)
          vm.error = err.message
        })
    }


    // Save Arbitration
    function save(isValid) {
      if (!isValid) {
        $scope.$broadcast('show-errors-check-validity', 'vm.form.arbitrationForm');
        return false;
      }

      // TODO: move create/update logic to service
      if (vm.arbitration._id) {
        vm.arbitration.$update(successCallback, errorCallback);
      } else {
        vm.arbitration.$save(successCallback, errorCallback);
      }

      function successCallback(res) {
        $state.go('arbitrations.listPending')
      }

      function errorCallback(res) {
        vm.error = res.data.message;
      }
    }


      // { id: 2,name: 'Set2x Stake By Seller(You must be the seller)'},
      // { id: 3,name: 'Set2x Stake by Reporter(You must be original reporter)'},
      // { id: 4,name: 'Set Arbitrator as yourself'},
      // { id: 5,name: 'Set Winner'}

    function applyAction() {
      console.log(vm.selectedAction)
      switch(parseInt(vm.selectedAction)) {
          case 1:
              set2xStakeBySeller()              
              break;
          case 2:
              set2xStakeByReporter()              
              break;
          case 3:
              setArbitrator()              
              break;
          case 4:
              setWinner()              
              break;          
          default:
              alert('NOT VALID SELECTION')
              break;
      }      

    }       
  }
}());
