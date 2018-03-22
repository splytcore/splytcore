(function () {
  'use strict';

  angular
    .module('candidates')
    .controller('CandidatesListController', CandidatesListController);

  CandidatesListController.$inject = ['CandidatesService'];

  function CandidatesListController(CandidatesService) {
    var vm = this
    vm.applyFilters = applyFilters

    vm.findCandidate = findCandidate

    CandidatesService.list()
      .success((res) => {
        console.log(res)
        vm.candidates = res
      })
      .error((res) => {
        console.log('failure')
        console.log(res)        
      })      


    function applyFilters() {
      vm.filters = vm.department ? ('department='+ vm.department) : ''
      vm.filters += vm.status ? ('&status='+ vm.status) : ''
      vm.filters += vm.stage ? ('&stage='+ vm.stage) : ''
      console.log(vm.filters)            
      CandidatesService.listByFilters(vm.filters)
        .success((res) => {
          console.log(res)
          vm.candidates = res
        })
        .error((res) => {
          console.log('failure')
          console.log(res)        
        })          
    }


    function findCandidate() {
      console.log(vm.filters)            
      CandidatesService.findCandidate(vm.search)
        .success((res) => {
          console.log(res)
          vm.candidates = res
        })
        .error((res) => {
          console.log('failure')
          console.log(res)        
        })          
    }


  }
}());
