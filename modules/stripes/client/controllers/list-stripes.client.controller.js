(function () {
  'use strict';

  angular
    .module('stripes')
    .controller('StripesListController', StripesListController);

  StripesListController.$inject = ['StripesService', 'StripesManagerService', 'Authentication', '$scope', '$rootElement'];

  function StripesListController(StripesService, StripesManagerService, Authentication, $scope, $rootElement) {
    
    var vm = this
    vm.igLogin = igLogin
    $scope.authentication = Authentication


    function igLogin() {
      let clientId = '09156f2dbd264bdb8652cff79b354b36'
      let redirectUrl = 'http://' + window.location.host + window.location.pathname
      window.location.replace('https://api.instagram.com/oauth/authorize/?client_id=' + clientId + '&redirect_uri=' + redirectUrl + '&response_type=code')
    }
    
    if(window.location.search.substring(1).split('=')[0] === 'code' && Authentication.user.igAccessToken === '') {
      vm.isIgAuthenticated = true
      let igCode = window.location.search.substring(1).split('=')[1]
      StripesManagerService.saveIgCode(igCode)
    } else {
      vm.isIgAuthenticated = false
    }

    try{
      if(window.location.search.substring(1).split('&')[1].split('=')[0] === 'error') {
        vm.isIgErrored = true
      }
    } catch {}

    if(Authentication.user.igAccessToken !== '') {
      vm.isIgAuthenticated = true 
    }
  }
}());
