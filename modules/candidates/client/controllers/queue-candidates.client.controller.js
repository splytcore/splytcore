(function () {
  'use strict';

  angular
    .module('candidates')
    .controller('CandidatesQueueController', CandidatesQueueController);

  CandidatesQueueController.$inject = ['CandidatesService'];

  function CandidatesQueueController(CandidatesService) {
    var vm = this
    vm.findCandidate = findCandidate

    CandidatesService.listCheckins()
      .success((res) => {
        console.log(res)
        vm.candidates = res
      })
      .error((res) => {
        console.log('failure')
        console.log(res)        
      })      
    
    function findCandidate() {
      CandidatesService.findCandidate(vm.query)
        .success((res) => {          
          vm.candidates = res
        })
        .error((res) => {
          console.log('failure')
          console.log(res)
          vm.error = res.message
        })  
    }


  }
}());
