(function () {
  'use strict';

  angular
    .module('candidates')
    .controller('CandidatesCheckinController', CandidatesCheckinController);

  CandidatesCheckinController.$inject = ['CandidatesService', '$state'];

  function CandidatesCheckinController(CandidatesService, $state) {
    var vm = this
    vm.findByEmail = findByEmail

    function findByEmail() {
      CandidatesService.findByEmail(vm.query)
        .success((res) => {          
          vm.candidate = res                              
          $state.go('candidates.edit', { candidateId: vm.candidate._id })
        })
        .error((res) => {
          console.log('failure')
          console.log(res)
          vm.error = res.message
        })  
    }


  }
}());
