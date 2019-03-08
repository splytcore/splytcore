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
    getGeneralSummary()
    getAffiliateFollowers()
    getHashtagsUsed()

    function getGeneralSummary(startTimeMs, endTimeMs) {
      let apiUrl = 'api/analytics/generalSalesSummary'
      if(startTimeMs > 0 && endTimeMs > 0) {
        apiUrl = apiUrl + '?startTimeMs=' + startTimeMs + '&endTimeMs=' + endTimeMs
      }
      console.log(apiUrl)
      $http.get(apiUrl)
      .then((result) => {
        vm.summary = Object.assign(vm.summary, result.data)
        console.log(vm.summary)
      }, (error) => {
        vm.error = error.toString()
      })
    }
    
    function getAffiliateFollowers() {
      $http.get('api/analytics/generalSalesSummary/affiliatesfollowers')
      .then(result => {
        console.log('totalFollowers from influencers', result)
        vm.summary.totalInfluencerFollowers = result.data
      })
    }
    
    function getHashtagsUsed() {
      $http.get('api/analytics/generalSalesSummary/hashtagsused')
      .then(result => {
        console.log('hashtags used on IG', result.data)
        vm.summary.totalHashtagsOnIg = result.data
      })
    }
    

    //toggle calender view
    $scope.open = function($event) {
      $event.preventDefault();
      $event.stopPropagation();
      $scope.opened = true;
    };

    $scope.updateData = function() {
      if(!$scope.dt) return getGeneralSummary()
      getGeneralSummary($scope.dt.getTime(), $scope.dt.getTime() + 86400000)
    }

  }
}())
