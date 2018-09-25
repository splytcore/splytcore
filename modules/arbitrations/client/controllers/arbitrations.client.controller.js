(function () {
  'use strict';

  // Arbitrations controller
  angular
    .module('arbitrations')
    .controller('ArbitrationsController', ArbitrationsController);

  ArbitrationsController.$inject = ['$scope', '$state', '$window', 'Authentication', 'arbitrationResolve', '$stateParams', 'EthService'];

  function ArbitrationsController ($scope, $state, $window, Authentication, arbitration, $stateParams, EthService) {
    
    console.log($stateParams)

    var vm = this;
    console.log(arbitration)
    vm.title = $stateParams.title

    vm.user = Authentication.user;
    vm.arbitration = arbitration;
    vm.arbitration.assetAddress = $stateParams.assetAddress
    vm.error = null;
    vm.form = {};
    vm.remove = remove;
    vm.save = save;

    if (!arbitration._id) {
        vm.defaultArbitrator = vm.user.publicKey
        arbitration.reporterWallet = vm.user.publicKey
        arbitration.reason = 0
  }
    // Remove existing Arbitration
    function remove() {
      if ($window.confirm('Are you sure you want to delete?')) {
        vm.arbitration.$remove($state.go('arbitrations.list'));
      }
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
