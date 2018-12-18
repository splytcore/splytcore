(function () {
  'use strict';

  angular
    .module('dashboards')
    .controller('DashboardsSellerListController', DashboardsSellerListController);

  DashboardsSellerListController.$inject = ['AssetsService', 'OrdersService'];

  function DashboardsSellerListController(AssetsService, OrdersService) {
    var vm = this;
  }
}());
