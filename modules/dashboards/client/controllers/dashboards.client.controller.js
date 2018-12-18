(function () {
  'use strict';

  // Dashboards controller
  angular
    .module('dashboards')
    .controller('DashboardsController', DashboardsController);

  DashboardsController.$inject = ['$scope', '$state', '$window', 'Authentication', 'dashboardResolve'];

  function DashboardsController ($scope, $state, $window, Authentication, dashboard) {
    var vm = this;

    vm.authentication = Authentication;
    vm.dashboard = dashboard;
    vm.error = null;
    vm.form = {};
    vm.remove = remove;
    vm.save = save;

    // Remove existing Dashboard
    function remove() {
      if ($window.confirm('Are you sure you want to delete?')) {
        vm.dashboard.$remove($state.go('dashboards.list'));
      }
    }

    // Save Dashboard
    function save(isValid) {
      if (!isValid) {
        $scope.$broadcast('show-errors-check-validity', 'vm.form.dashboardForm');
        return false;
      }

      // TODO: move create/update logic to service
      if (vm.dashboard._id) {
        vm.dashboard.$update(successCallback, errorCallback);
      } else {
        vm.dashboard.$save(successCallback, errorCallback);
      }

      function successCallback(res) {
        $state.go('dashboards.view', {
          dashboardId: res._id
        });
      }

      function errorCallback(res) {
        vm.error = res.data.message;
      }
    }
  }
}());
