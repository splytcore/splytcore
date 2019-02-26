(function () {
  'use strict';

  // Preregistrations controller
  angular
    .module('preregistrations')
    .controller('PreregistrationsController', PreregistrationsController);

  PreregistrationsController.$inject = ['PreregistrationsService','$scope', '$state', '$window', 'Authentication', 'preregistrationResolve'];

  function PreregistrationsController (PreregistrationsService, $scope, $state, $window, Authentication, preregistration) {
    var vm = this;

    vm.authentication = Authentication
    vm.preregistration = preregistration
    vm.error = null
    vm.form = {}
    vm.save = save

    // Save Preregistration
    function save(isValid) {
      if (!isValid) {
        $scope.$broadcast('show-errors-check-validity', 'vm.form.preregistrationForm');
        return false;
      }

      console.log(vm.signupTokens)
      vm.tokens = vm.signupTokens.split(',')

      //for testing
      // let length = vm.tokens.length
      // for (let i = 0; i < 100; i++) {
      //   vm.tokens.push(i.toString())
      // }

      vm.tokens.forEach((token) => {
        vm.preregistration = new PreregistrationsService()
        vm.preregistration.signupToken = token
        vm.preregistration.$save()
          .then((result) => {  
            console.log('saved')
          })
          .catch((err) => {
            console.log(err)
          })          
      })
      $state.go('preregistrations.list')
    }
  }
}())
