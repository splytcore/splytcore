'use strict';

angular.module('users').controller('AuthenticationController', ['$scope', '$state', '$http', '$location', '$window', 'Authentication', 'PasswordValidator',
  function ($scope, $state, $http, $location, $window, Authentication, PasswordValidator) {
    $scope.authentication = Authentication;
    $scope.popoverMsg = PasswordValidator.getPopoverMsg();

    // Get an eventual error defined in the URL query string:
    $scope.error = $location.search().err;

    // If user is signed in then redirect back home    
    if ($scope.authentication.user) {
      $location.path('/');
    }

    $scope.signup = function (isValid) {
      $scope.error = null;

      if (!isValid) {
        $scope.$broadcast('show-errors-check-validity', 'userForm');

        return false;
      }


      $http.post('/api/auth/signup', $scope.credentials).success(function (response) {
        // If successful we assign the response to the global user model
        $scope.authentication.user = response;

        if ($scope.authentication.user.roles.indexOf('affiliate') > -1) {
          $state.go('stripes.list')
        } else {
          // And redirect to the previous or home page
          $state.go($state.previous.state.name || 'home', $state.previous.params);
        }
      }).error(function (response) {
        $scope.error = response.message;
      });
    };

    $scope.signin = function (isValid) {
      $scope.error = null;

      if (!isValid) {
        $scope.$broadcast('show-errors-check-validity', 'userForm');

        return false;
      }

      $http.post('/api/auth/signin', $scope.credentials).success(function (response) {
        // If successful we assign the response to the global user model
        $scope.authentication.user = response.user;
        // And redirect to the previous or home page according to role

        if ($scope.authentication.user.roles.indexOf('admin') > -1) {
          $state.go('analytics.summary')
        } else 
        if ($scope.authentication.user.roles.indexOf('seller') > -1) {
          $state.go($state.previous.state.name || 'sellers.dashboard', $state.previous.params)
        } else 
        if ($scope.authentication.user.roles.indexOf('affiliate') > -1) {
          $state.go($state.previous.state.name || 'affiliates.dashboard', $state.previous.params)
        } else {
          $state.go($state.previous.state.name || 'home', $state.previous.params);
        }
      

      }).error(function (response) {
        $scope.error = response.message;
      });
    };

  }
]);
