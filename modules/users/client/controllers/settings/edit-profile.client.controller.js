'use strict';

angular.module('users').controller('EditProfileController', ['$cookies', '$scope', '$http', '$location', 'Users', 'Authentication', '$rootScope',
  function ($cookies, $scope, $http, $location, Users, Authentication, $rootScope) {
    $scope.user = Authentication.user;
    
    console.log($scope.user)
    // console.log('ether balance: ')
    // console.log($scope.user.etherBalance)

    // $rootScope.etherBalance = $scope.user.etherBalance
    // $rootScope.tokenBalance = $scope.user.tokenBalance

    // Update a user profile
    $scope.createNewWallet = function () {
  
    }

    // Update a user profile
    $scope.updateUserProfile = function (isValid) {
      $scope.success = $scope.error = null;

      if (!isValid) {
        $scope.$broadcast('show-errors-check-validity', 'userForm');

        return false;
      }

      var user = new Users($scope.user);
      // console.log('role: ' + user.roles)
      var roles = []
      roles.push(user.roles)

      user.roles = roles;
      
      console.log(user.roles)
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
