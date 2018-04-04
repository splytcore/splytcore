(function () {
  'use strict';

  // Candidates controller
  angular
    .module('candidates')
    .controller('CandidatesController', CandidatesController);

  CandidatesController.$inject = ['$scope', '$state', '$window', 'Authentication', 'CandidatesService', 'FileUploader', '$timeout'];

  function CandidatesController ($scope, $state, $window, Authentication, CandidatesService, FileUploader, $timeout) {
    
    var vm = this;
    vm.authentication = Authentication;

    vm.error = null
    vm.form = {}
    vm.remove = remove
    vm.update = update       
    vm.checkin = checkin
    vm.unlock = unlock
    
    CandidatesService.listAllEnumValues()
      .success((res) => {
        console.log(res)          
        vm.positions = res.positions
        vm.departments = res.departments
        vm.registeredFrom = res.registeredFrom
        vm.stages = res.stages
        vm.valuations = res.valuations
      })
      .error((res) => {
        console.log('failure')
        console.log(res)
      })

    vm.note = ''

    if ($state.params.candidateId) {
      CandidatesService.lock($state.params.candidateId)
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

    // Remove existing Candidate
    function remove() {
      if ($window.confirm('Are you sure you want to delete?')) {        
        CandidatesService.remove(vm.candidate._id)
          .success((res) => {
            console.log(res) 
            vm.success = res.message                 
            $state.go('candidates.list')
          })
          .error((res) => {
            console.log('failure')
            vm.error = res.message
          })        
      }
    }

    // checkin
    function checkin() {
      
      CandidatesService.checkin(vm.candidate.email)
        .success((res) => {
          console.log(res) 
          vm.success = res.message                             
        })
        .error((res) => {
          console.log('failure')
          vm.error = res.message
        })  

    }

    function update() {

      if (vm.note.length > 0) {
        vm.candidate.notes.push({ note: vm.note, user: vm.authentication.user._id })  
      }      

      CandidatesService.update(vm.candidate)
        .success((res) => {
          console.log(res)
          vm.candidate = res
        })
        .error((res) => {
          console.log('failure')
          vm.error = res.message
        })  

    }

    function unlock() {
      CandidatesService.unlock(vm.candidate._id)
        .success((res) => {
          console.log(res) 
          vm.success = res.message                         
        })
        .error((res) => {
          console.log('failure')
          vm.error = res.message
        })
    }



  }
}());
