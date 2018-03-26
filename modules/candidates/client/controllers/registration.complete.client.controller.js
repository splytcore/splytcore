(function () {
  'use strict';

  // Candidates controller
  angular
    .module('candidates')
    .controller('RegistrationCompleteController', RegistrationCompleteController);

  RegistrationCompleteController.$inject = ['$scope', '$state', '$window', 'Authentication'];

  function RegistrationCompleteController ($scope, $state, $window, Authentication) {
    
    var vm = this;
    vm.authentication = Authentication;    
    vm.registeredFrom = $state.params.registeredFrom;
    

  }
}());
