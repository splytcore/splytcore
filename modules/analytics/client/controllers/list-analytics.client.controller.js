(function () {
  'use strict';

  angular
    .module('analytics')
    .controller('AnalyticsListController', AnalyticsListController);

  AnalyticsListController.$inject = ['AnalyticsService'];

  function AnalyticsListController(AnalyticsService) {
    var vm = this;

    vm.analytics = AnalyticsService.query();
  }
}());
