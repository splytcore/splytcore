'use strict';

angular.module('users').controller('SettingsController', ['$scope', 'Authentication', 'EthService',
  function ($scope, Authentication, EthService) {
    $scope.user = Authentication.user;
    // EthService.getUserBalances()
    // .success((balances) => {
    // 	console.log(balances)
    // 	$scope.user.etherBalance = balances.etherBalance
    // 	$scope.user.tokenBalance = balances.tokenBalance    	
    // })
    // .error((err) => {

    // })
  }
]);
