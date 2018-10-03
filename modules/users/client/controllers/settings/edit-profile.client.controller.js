'use strict';

angular.module('users').controller('EditProfileController', ['$scope', '$http', '$location', 'Users', 'Authentication', 'EthService',
  function ($scope, $http, $location, Users, Authentication, EthService) {
    $scope.user = Authentication.user;
      

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
      }, function (response) {
        $scope.error = response.data.message;
      });
    }

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
