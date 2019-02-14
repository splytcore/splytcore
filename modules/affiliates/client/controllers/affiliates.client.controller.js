(function () {
  'use strict';

  // Affiliates controller
  angular
    .module('affiliates')
    .controller('AffiliatesController', AffiliatesController);

  AffiliatesController.$inject = ['$scope', '$state', '$window', 'Authentication', 'AnalyticsManagerService'];

  function AffiliatesController ($scope, $state, $window, Authentication, AnalyticsManagerService) {
    var vm = this;

    vm.authentication = Authentication;
    vm.user = vm.authentication.user;
    vm.error = null;
    vm.form = {};

    // AnalyticsManagerService.getAffiliatesGrossSales()
    //   .then((result) => {
    //     vm.affiliateSales = result
    //   })
    //   .catch((err) => {
    //     vm.error = err.toString()
    //   })

  }
}());
