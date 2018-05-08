(function () {
  'use strict';

  // Candidates controller
  angular
    .module('candidates')
    .controller('CandidatesController', CandidatesController);

  CandidatesController.$inject = ['$scope', '$state', '$window', 'Authentication', 'CandidatesService', 'PositionsService', 'FileUploader', '$timeout'];

  function CandidatesController ($scope, $state, $window, Authentication, CandidatesService, PositionsService, FileUploader, $timeout) {
    
    var vm = this;
    vm.authentication = Authentication;

    vm.error = null
    vm.form = {}
    vm.remove = remove
    vm.update = update       
    vm.checkin = checkin
    vm.unlock = unlock
    vm.lock = lock
    vm.reviewPage = reviewPage
    vm.appointmentPage = appointmentPage
    
    CandidatesService.listAllEnumValues()
      .success((res) => {

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
      CandidatesService.get($state.params.candidateId)
        .success((res) => {
          vm.candidate = res              
        })
        .error((res) => {
          console.log('failure')
          console.log(res)
        })  
    } else {
      vm.candidate = {}
    }

    PositionsService.list()
      .success((res) => {
        vm.positions = res            
      })
      .error((res) => {
        console.log('failure')
        console.log(res)
      })  


    function appointmentPage() {      
      if (vm.candidate.appointment) {
        $state.go('appointments.edit', { appointmentId: vm.candidate.appointment._id })
      } else {
        alert('sorry no appointment found')
      }
    }


    function reviewPage() {
      $state.go('reviews.edit', { candidateId: vm.candidate._id })
    }
    // Remove existing Candidate
    function remove() {
      if ($window.confirm('Are you sure you want to delete?')) {        
        CandidatesService.remove(vm.candidate._id)
          .success((res) => {
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
          vm.candidate = res
          vm.success = 'successful updated'
        })
        .error((res) => {
          console.log('failure')
          vm.error = res.message
        })  

    }

    function unlock() {
      CandidatesService.unlock(vm.candidate._id)
        .success((res) => {
          vm.success = res.message                         
          vm.candidate.lockedBy = null
        })
        .error((res) => {
          console.log('failure')
          vm.error = res.message
        })
    }

    function lock() {
      CandidatesService.lock(vm.candidate._id)
        .success((res) => {
          vm.success = res.message
          vm.candidate.lockedBy = vm.authentication.user                         
        })
        .error((res) => {
          console.log('failure')
          vm.error = res.message
        })
    }



  }
}());
