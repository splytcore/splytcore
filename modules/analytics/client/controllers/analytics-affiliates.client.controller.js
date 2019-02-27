(function () {
  'use strict';

  // Analytics controller
  angular
    .module('analytics')
    .controller('AnalyticsAffiliatesController', AnalyticsAffiliatesController);

  AnalyticsAffiliatesController.$inject = ['$stateParams', '$http', '$scope', '$state', '$window', 'Authentication'];

  function AnalyticsAffiliatesController ($stateParams, $http, $scope, $state, $window, Authentication) {
    var vm = this;

    vm.authentication = Authentication;

    vm.error = null;
   
    console.log($stateParams.affiliateId)      
    if ($stateParams.affiliateId) {
      $http.get('api/analytics/affiliates/grossSales?userId=' + $stateParams.affiliateId)
        .then((result) => {
          vm.result = result.data
        }, (error) => {
          console.log(error)
          vm.error = error.data.message
          alert(vm.error)
        })          
    } else {
      $http.get('api/analytics/affiliates?role=affiliate')
        .then((result) => {
          vm.affiliates = result.data
          console.log(vm.affiliates)
        }, (error) => {
          vm.error = error.data.message
          alert(vm.error)
        })    
    }      
  }
}())
