(function () {
  'use strict';

  // Arbitrations controller
  angular
    .module('arbitrations')
    .controller('ArbitrationsController', ArbitrationsController);

  ArbitrationsController.$inject = ['$scope', '$state', '$window', 'Authentication', 'arbitrationResolve', '$stateParams', 'EthService', 'ArbitraitionsManagerService'];

  function ArbitrationsController ($scope, $state, $window, Authentication, arbitration, $stateParams, EthService, ArbitraitionsManagerService) {
    
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

    vm.setArbitrator = setArbitrator
    vm.set2xStakeByReporter = set2xStakeByReporter
    vm.set2xStakeBySeller = set2xStakeBySeller
    vm.setWinner = setWinner



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
          console.log(result)
          console.log('success update')
        })
        .error((err) => {
          console.log(err)
        })
    }

    function setWinner() {
      ArbitraitionsManagerService.setWinner(vm.arbitration._id, vm.arbitration.winner)
        .success((result) => {
          console.log(result)
          console.log('success update')
        })
        .error((err) => {
          console.log(err)
        })
    }

    function set2xStakeByReporter() {
      ArbitraitionsManagerService.set2xStakeByReporter(vm.arbitration._id)
        .success((result) => {
          console.log(result)
          console.log('success update')
        })
        .error((err) => {
          console.log(err)
        })
    }

    function set2xStakeBySeller() {
      ArbitraitionsManagerService.set2xStakeBySeller(vm.arbitration._id)
        .success((result) => {
          console.log(result)
          console.log('success update')
        })
        .error((err) => {
          console.log(err)
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
        $state.go('arbitrations.list')
      }

      function errorCallback(res) {
        vm.error = res.data.message;
      }
    }
  }
}());
