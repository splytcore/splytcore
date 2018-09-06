(function () {
  'use strict';

  // Arbitrations controller
  angular
    .module('arbitrations')
    .controller('ArbitrationsController', ArbitrationsController);

  ArbitrationsController.$inject = ['$scope', '$state', '$window', 'Authentication', 'arbitrationResolve'];

  function ArbitrationsController ($scope, $state, $window, Authentication, arbitration) {
    var vm = this;

    vm.authentication = Authentication;
    vm.arbitration = arbitration;
    vm.error = null;
    vm.form = {};
    vm.remove = remove;
    vm.save = save;

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
        $state.go('arbitrations.view', {
          arbitrationId: res._id
        });
      }

      function errorCallback(res) {
        vm.error = res.data.message;
      }
    }
  }
}());
