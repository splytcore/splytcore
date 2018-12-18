(function () {
  'use strict';

  // Dashboards controller for sellers
  angular
    .module('dashboards')
    .controller('DashboardsSellerController', DashboardsSellerController)

  DashboardsSellerController.$inject = ['$scope', '$state', '$window', 'Authentication', 'AssetsService']

  function DashboardsSellerController ($scope, $state, $window, Authentication, AssetsService) {
    let vm = this

    vm.authentication = Authentication
    vm.error = null
    vm.form = {}

    vm.assets = AssetsService.query({ listType: 'ASSETS.LISTMYASSETS' })

    
    console.log(vm.assets)

  }
}())
