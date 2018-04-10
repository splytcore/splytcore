(function () {
  'use strict';

  // Candidates controller
  angular
    .module('candidates')
    .controller('RegisterController', RegisterController);

  RegisterController.$inject = ['$scope', '$state', '$window', 'Authentication', 'CandidatesService', 'FileUploader', '$timeout', '$http'];

  function RegisterController ($scope, $state, $window, Authentication, CandidatesService, FileUploader, $timeout, $http) {
    
    var vm = this;
    vm.authentication = Authentication;

    vm.error = null
    vm.form = {}   
    
    vm.candidate = {}
    vm.candidate.registeredFrom = 'WEB'
    vm.registerURL = '/api/register/' + vm.candidate.registeredFrom

    console.log(vm.registerURL)

    vm.register = register

    CandidatesService.listAllEnumValues()
      .success((res) => {
        console.log(res)                  
        vm.registeredFrom = res.registeredFrom
      })
      .error((res) => {
        console.log('failure')
        console.log(res)
      })      

    CandidatesService.listPositions()
      .success((res) => {
        console.log(res)      
        console.log(res)    
        vm.positions = res
      })
      .error((res) => {
        console.log('failure')
        console.log(res)
      })      


    // CandidatesService.listEnumValues('position')
    //   .success((res) => {
    //     console.log(res)          
    //     vm.positions = res
    //   })
    //   .error((res) => {
    //     console.log('failure')
    //     console.log(res)
    //   })      

    // CandidatesService.listEnumValues('registeredFrom')
    //   .success((res) => {
    //     console.log(res)          
    //     vm.registeredFrom = res
    //   })
    //   .error((res) => {
    //     console.log('failure')
    //     console.log(res)
    //   })      

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
    function register() {

      let fd = new FormData();
      if (vm.candidate.registeredFrom.indexOf('WEB') > -1) {
        fd.append('newResumeDoc', vm.newResumeDoc)
      } else {
        angular.forEach(vm.newResumeImages, function (image) {
          fd.append('newResumeImages', image);
        })         
      }

      angular.forEach(vm.candidate, function (value, key) {
        fd.append(key, value);
      })      
      
      let url = '/api/register/' + vm.candidate.registeredFrom

      $http.post(url, fd, {
        transformRequest: angular.identity,
        headers: { 'Content-Type': undefined }
      })      
      .success((res) => {        
        vm.success = res.message 
      })
      .error((res) => {
        vm.error = res.message
      });

      // CandidatesService.register(vm.candidate)
      //   .success((res) => {          
      //     alert('success!')
      //   })
      //   .error((res) => {
      //     console.log('failure')
      //     vm.error = res.message
      //   })  

    }

  }
}());
