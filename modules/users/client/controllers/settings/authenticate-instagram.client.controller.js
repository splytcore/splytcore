(function () {
  'use strict';

  angular
    .module('core')
    .controller('AuthenticateInstagramController', AuthenticateInstagramController);

    AuthenticateInstagramController.$inject = ['Authentication', '$scope', '$rootElement', 'Users', '$http'];

  function AuthenticateInstagramController(Authentication, $scope, $rootElement, Users, $http) {
    
    $scope.authentication = Authentication
    let redirectUri = window.location.origin + '/settings/authenticateInstagram'
    console.log(window.location)

    $scope.igLogin = () => {
      let clientId = '09156f2dbd264bdb8652cff79b354b36'
      console.log(redirectUri)
      window.location.replace('https://api.instagram.com/oauth/authorize/?client_id=' + clientId + '&redirect_uri=' + redirectUri + '&response_type=code')
    }

    $scope.igLogout = () => {
      var user = new Users($scope.user);
      var roles = []
      roles.push(user.roles)

      user.roles = roles
      user.igAccessToken = ''
      
      user.$update(function (response) {
        $scope.$broadcast('show-errors-reset', 'userForm')

        $scope.success = true
        Authentication.user = response
        
      }, function (response) {
        $scope.error = response.data.message;
      });
    }
    
    if(window.location.search.substring(1).split('=')[0] === 'code' && Authentication.user.igAccessToken === '') {
      console.log(Authentication.user.igAccessToken)
      $scope.isIgAuthenticated = true
      let igCode = window.location.search.substring(1).split('=')[1]
      $http.put('/api/users', {
        igCode: igCode,
        redirectUri: redirectUri
      });
      window.location.search = ''
    } else {
      $scope.isIgAuthenticated = false
    }

    try{
      if(window.location.search.substring(1).split('&')[1].split('=')[0] === 'error') {
        $scope.isIgErrored = true
      }
    } catch {}

    if(Authentication.user.igAccessToken !== '') {
      $scope.isIgAuthenticated = true 
    }
  }
}());
