(function () {
  'use strict';

  angular
    .module('candidates')
    .controller('CandidatesCheckinController', CandidatesCheckinController);

  CandidatesCheckinController.$inject = ['CandidatesService', '$state'];

  function CandidatesCheckinController(CandidatesService, $state) {
    var vm = this
    vm.findCandidate = findCandidate        

    function findCandidate() {
      CandidatesService.findCandidate(vm.query)
        .success((res) => {          
          vm.candidates = res          
          console.log(vm.candidates.length)
          if (vm.candidates.length > 0) {
            $state.go('candidates.edit', { candidateId: vm.candidates[0]._id })
          } else {
            vm.error = 'User not found'
          }
        })
        .error((res) => {
          console.log('failure')
          console.log(res)
          vm.error = res.message
        })  
    }


  }
}());
