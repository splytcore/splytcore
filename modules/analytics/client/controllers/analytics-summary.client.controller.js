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

    vm.error = null
    vm.summary = {}

    $http.get('api/analytics/generalSalesSummary')
    .then((result) => {
      vm.summary = Object.assign(vm.summary, result.data)
      console.log(vm.summary)
    }, (error) => {
      vm.error = error.toString()
    })

    // $http.get('api/analytics/generalSalesSummary/affiliatesfollowers')
    // .then(result => {
    //   console.log('totalFollowers from influencers', result)
    //   vm.summary.totalInfluencerFollowers = result.data
    // })

    // $http.get('api/analytics/generalSalesSummary/hashtagsused')
    // .then(result => {
    //   console.log('hashtags used on IG', result.data)
    //   vm.summary.totalHashtagsOnIg = result.data
    // })

  }
}())
