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
          if (vm.candidate.registeredFrom.indexOf('WEB') > -1) {
            console.log('uploading document')            
            // uploadDocResume()
            $state.go('candidates.uploadResume', { email: vm.candidate.email, registeredFrom: vm.candidate.registeredFrom })
          } else {
            console.log('uploading image')            
            $state.go('candidates.uploadResume', { email: vm.candidate.email, registeredFrom: vm.candidate.registeredFrom })
            // uploadImageResume()  
          }          
        })
        .error((res) => {
          console.log('failure')
          vm.error = res.message
        })  

    }

  }
}());
