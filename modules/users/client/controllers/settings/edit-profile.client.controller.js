'use strict';

angular.module('users').controller('EditProfileController', ['$cookies', '$scope', '$http', '$location', 'Users', 'Authentication', 'EthService', '$rootScope',
  function ($cookies, $scope, $http, $location, Users, Authentication, EthService, $rootScope) {
    $scope.user = Authentication.user;
    
    // console.log('ether balance: ')
    // console.log($scope.user.etherBalance)

    // $rootScope.etherBalance = $scope.user.etherBalance
    // $rootScope.tokenBalance = $scope.user.tokenBalance

    // Update a user profile
    $scope.createNewWallet = function () {
      EthService.createNewWallet($scope.user.walletPassword)
        .success((result) => {
          console.log(result)
          $scope.user.publicKey = result.publicKey
          $scope.success = true;
        })
        .error((err) => {
          console.log(err)
        })

    }

    // Update a user profile
    $scope.updateUserProfile = function (isValid) {
      $scope.success = $scope.error = null;

      if (!isValid) {
        $scope.$broadcast('show-errors-check-validity', 'userForm');

        return false;
      }

      var user = new Users($scope.user);

      user.$update(function (response) {
        $scope.$broadcast('show-errors-reset', 'userForm');

        $scope.success = true;
        Authentication.user = response;
        
        EthService.updateUserBalances()

      }, function (response) {
        $scope.error = response.data.message;
      });
    }

    // $scope.updateUserBalances = function () {

    //   EthService.getUserBalances()
    //     .success((balances) => {
    //       console.log(balances)
    //       // $rootScope.etherBalance = balances.etherBalance
    //       // $rootScope.tokenBalance = balances.tokenBalance    
          
    //       Authentication.user.etherBalance = balances.etherBalance
    //       Authentication.user.tokenBalance = balances.tokenBalance
    //       $scope.user = Authentication.user

    //       // $cookies.tokenBalance = balances.tokenBalance
    //       // $cookies.etherBalance = balances.etherBalance

    //       if (parseFloat(balances.etherBalance) < .10 ||  parseInt(balances.tokenBalance) < 1) {
    //         alert('You do not have the minimium requirements of tokens or Ether to write to the blockchain!')
    //       }

    //     })
    //     .error((err) => {

    //     })

    // }

    $scope.initUser = function () {
      $scope.success = $scope.error = null;

      $http.get('/api/eth/initUser?wallet=' + $scope.user.publicKey)
      .success((result) => {
        alert(result)
      })
      .error((err)=> {
        console.log(err)
      })
    }
  }
]);
