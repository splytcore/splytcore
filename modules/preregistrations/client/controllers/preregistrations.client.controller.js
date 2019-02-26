(function () {
  'use strict';

  // Preregistrations controller
  angular
    .module('preregistrations')
    .controller('PreregistrationsController', PreregistrationsController);

  PreregistrationsController.$inject = ['$scope', '$state', '$window', 'Authentication', 'preregistrationResolve'];

  function PreregistrationsController ($scope, $state, $window, Authentication, preregistration) {
    var vm = this;

    vm.authentication = Authentication;
    vm.preregistration = preregistration;
    vm.error = null;
    vm.form = {};
    vm.remove = remove;
    vm.save = save;

    // Remove existing Preregistration
    function remove() {
      if ($window.confirm('Are you sure you want to delete?')) {
        vm.preregistration.$remove($state.go('preregistrations.list'));
      }
    }

    // Save Preregistration
    function save(isValid) {
      if (!isValid) {
        $scope.$broadcast('show-errors-check-validity', 'vm.form.preregistrationForm');
        return false;
      }

      // TODO: move create/update logic to service
      if (vm.preregistration._id) {
        vm.preregistration.$update(successCallback, errorCallback);
      } else {
        vm.preregistration.$save(successCallback, errorCallback);
      }

      function successCallback(res) {
        $state.go('preregistrations.list')
      }

      function errorCallback(res) {
        vm.error = res.data.message;
      }
    }
  }
}());
