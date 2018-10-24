(function () {
  'use strict';

  // Analytics controller
  angular
    .module('analytics')
    .controller('AnalyticsController', AnalyticsController);

  AnalyticsController.$inject = ['$scope', '$state', '$window', 'Authentication', 'analyticResolve'];

  function AnalyticsController ($scope, $state, $window, Authentication, analytic) {
    var vm = this;

    vm.authentication = Authentication;
    vm.analytic = analytic;
    vm.error = null;
    vm.form = {};
    vm.remove = remove;
    vm.save = save;

    // Remove existing Analytic
    function remove() {
      if ($window.confirm('Are you sure you want to delete?')) {
        vm.analytic.$remove($state.go('analytics.list'));
      }
    }

    // Save Analytic
    function save(isValid) {
      if (!isValid) {
        $scope.$broadcast('show-errors-check-validity', 'vm.form.analyticForm');
        return false;
      }

      // TODO: move create/update logic to service
      if (vm.analytic._id) {
        vm.analytic.$update(successCallback, errorCallback);
      } else {
        vm.analytic.$save(successCallback, errorCallback);
      }

      function successCallback(res) {
        $state.go('analytics.view', {
          analyticId: res._id
        });
      }

      function errorCallback(res) {
        vm.error = res.data.message;
      }
    }
  }
}());
