(function () {
  'use strict';

  // Reputations controller
  angular
    .module('reputations')
    .controller('ReputationsController', ReputationsController);

  ReputationsController.$inject = ['$scope', '$state', '$window', 'Authentication', 'reputationResolve', '$stateParams'];

  function ReputationsController ($scope, $state, $window, Authentication, reputation, $stateParams) {
    var vm = this;

    vm.authentication = Authentication;
    vm.user = vm.authentication.user
    console.log(vm.user)
    vm.reputation = reputation;
    vm.error = null;
    vm.form = {};
    vm.remove = remove;
    vm.save = save;

    if (!vm.reputation._id) {
      console.log('settin default')
      vm.reputation.fromWallet = vm.user.publicKey
      vm.reputation.wallet = $stateParams.wallet
      vm.reputation.rating = 5
    }

    // Remove existing Reputation
    function remove() {
      if ($window.confirm('Are you sure you want to delete?')) {
        vm.reputation.$remove($state.go('reputations.list'));
      }
    }

    // Save Reputation
    function save(isValid) {
      if (!isValid) {
        $scope.$broadcast('show-errors-check-validity', 'vm.form.reputationForm');
        return false;
      }

      // TODO: move create/update logic to service
      if (vm.reputation._id) {
        vm.reputation.$update(successCallback, errorCallback);
      } else {
        vm.reputation.$save(successCallback, errorCallback);
      }

      function successCallback(res) {
        $state.go('reputations.list')
      }

      function errorCallback(res) {
        vm.error = res.data.message;
      }
    }
  }
}());
