'use strict';

angular.module('users.admin').service('SystemsService', ['$http',  
  function ($http) {
    let vm = this
    
    vm.test = test
    vm.getSettings = getSettings
    vm.url = '/api/systems'
    function test() {
     
    }

    function getSettings() {
      return $http.get(vm.url)
    }

  }
]);
