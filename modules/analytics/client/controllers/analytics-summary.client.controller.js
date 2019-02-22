(function () {
  'use strict';

  // Analytics controller
  angular
    .module('analytics')
    .controller('AnalyticsSummaryController', AnalyticsSummaryController);

  AnalyticsSummaryController.$inject = ['$http', '$scope', '$state', '$window', 'Authentication'];

  function AnalyticsSummaryController ($http, $scope, $state, $window, Authentication) {
    var vm = this;

    vm.authentication = Authentication;

    vm.error = null;

    $http.get('api/analytics/generalSalesSummary')
      .then((result) => {
        vm.summary = result.data
        vm.error = 'testing error'
        console.log(vm.summary)
      }, (error) => {
        vm.error = error
      })    
  }
}())
