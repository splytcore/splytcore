(function () {
  'use strict'

  angular
    .module('analytics')
    .service('AnalyticsManagerService', AnalyticsManagerService)
                              
  AnalyticsManagerService.$inject = ['$http']

  function AnalyticsManagerService($http) {
    let vm = this
    vm.baseURL = 'api/analytics/'

    // vm.getAffiliatesGrossSales = function() {
    //   return 'hello'
    // }

  }

}())