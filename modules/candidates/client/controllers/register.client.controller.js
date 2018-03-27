(function () {
  'use strict';

  // Candidates controller
  angular
    .module('candidates')
    .controller('RegisterController', RegisterController);

  RegisterController.$inject = ['$scope', '$state', '$window', 'Authentication', 'CandidatesService', 'FileUploader', '$timeout'];

  function RegisterController ($scope, $state, $window, Authentication, CandidatesService, FileUploader, $timeout) {
    
    var vm = this;
    vm.authentication = Authentication;

    vm.error = null
    vm.form = {}   
    
    vm.candidate = {}
    vm.candidate.registeredFrom = 'MOBILE'
    vm.registerURL = '/api/register/' + vm.candidate.registeredFrom

    console.log(vm.registerURL)

    vm.register = register

    CandidatesService.listEnumValues('position')
      .success((res) => {
        console.log(res)          
        vm.positions = res
      })
      .error((res) => {
        console.log('failure')
        console.log(res)
      })      

    CandidatesService.listEnumValues('registeredFrom')
      .success((res) => {
        console.log(res)          
        vm.registeredFrom = res
      })
      .error((res) => {
        console.log('failure')
        console.log(res)
      })      

    if ($state.params.candidateId) {
      CandidatesService.get($state.params.candidateId)
        .success((res) => {
          console.log(res)          
          vm.candidate = res
        })
        .error((res) => {
          console.log('failure')
          console.log(res)
        })  
    } else {
      vm.candidate = {}
    }
  
    // register
    function register(isValid) {
      if (!isValid) {
        $scope.$broadcast('show-errors-check-validity', 'vm.form.candidateForm');
        return false;
      }

      CandidatesService.register(vm.candidate)
        .success((res) => {          
          alert('success!')
        })
        .error((res) => {
          console.log('failure')
          vm.error = res.message
        })  

    }

  }
}());
