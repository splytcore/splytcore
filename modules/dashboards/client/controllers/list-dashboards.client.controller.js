(function () {
  'use strict';

  angular
    .module('dashboards')
    .controller('DashboardsListController', DashboardsListController);

  DashboardsListController.$inject = ['DashboardsService'];

  function DashboardsListController(DashboardsService) {
    var vm = this;

    vm.dashboards = DashboardsService.query();
  }
}());
