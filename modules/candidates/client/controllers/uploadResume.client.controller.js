(function () {
  'use strict';

  // Candidates controller
  angular
    .module('candidates')
    .controller('UploadResumeController', UploadResumeController);

  UploadResumeController.$inject = ['$scope', '$state', '$window', 'Authentication', 'CandidatesService', '$timeout'];

  function UploadResumeController ($scope, $state, $window, Authentication, CandidatesService, $timeout) {
    
    var vm = this;
    vm.authentication = Authentication;

    vm.error = null
    vm.form = {}    
    vm.email = $state.params.email
    
    vm.uploadImageURL = '/api/register/MOBILE'
    vm.uploadDocURL = '/api/register/WEB'
                     
    vm.registeredFrom = $state.params.registeredFrom

    vm.finish = finish;    

    vm.fd = new FormData()

    function finish() {
      $state.go('candidates.registrationSuccess', { registeredFrom: $state.params.registeredFrom })
    }


  }
}());
