'use strict';

angular.module('users').controller('EditProfileController', ['$scope', '$http', '$location', 'Users', 'Authentication', 'DepartmentsService',
  function ($scope, $http, $location, Users, Authentication, DepartmentsService) {
    $scope.user = Authentication.user;


    DepartmentsService.list()
      .success((res) => {
         console.log(res)
        $scope.departments = res
      })
      .error((err) => {
        console.log(err)
      })  
      
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
    };
  }
]);
