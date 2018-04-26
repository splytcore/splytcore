(function () {
  'use strict';

  angular
    .module('candidates')
    .controller('CandidatesListController', CandidatesListController);

  CandidatesListController.$inject = ['CandidatesService', 'PositionsService', 'DepartmentsService', 'Socket', '$scope'];

  function CandidatesListController(CandidatesService, PositionsService, DepartmentsService, Socket, $scope) {
    var vm = this
    vm.applyFilters = applyFilters

    vm.findCandidate = findCandidate

    CandidatesService.list()
      .success((res) => {          
        vm.candidates = res
      })
      .error((res) => {
        console.log(res)        
      })      

    CandidatesService.listAllEnumValues()
      .success((res) => {        
        vm.registeredFrom = res.registeredFrom
        vm.stages = res.stages
        vm.valuations = res.valuations
      })
      .error((res) => {      
        console.log(res)
      })

    DepartmentsService.list()
      .success((res) => {
        vm.departments = res
      })
      .error((res) => {
        console.log('failure')
        console.log(res)
      })

    PositionsService.list()
      .success((res) => {
        vm.positions = res
      })
      .error((res) => {
        console.log('failure')
        console.log(res)
      })


    function applyFilters() {
      vm.filters += '?'
      vm.filters = vm.department ? ('department='+ vm.department) : ''
      vm.filters += vm.position ? ('&position='+ vm.position) : ''
      vm.filters += vm.stage ? ('&stage='+ vm.stage) : ''
      console.log(vm.filters)            
      CandidatesService.listByFilters(vm.filters)
        .success((res) => {
          
          console.log('number of results: ' + res.length)
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
          vm.candidates = res
        })
        .error((res) => {
          console.log('failure')
          console.log(res)        
        })          
    }


    // Make sure the Socket is connected
    if (!Socket.socket) {
      console.log('connecting to socket')
      Socket.connect();
    } else {
      console.log('already connect to socket')
    }

    // event listener for new checkins
    Socket.on('checkinChannel', function (candidate) {
      console.log(candidate)      
      console.log('checkinChannel event handler')      
    })

    // Remove the event listener when the controller instance is destroyed
    $scope.$on('$destroy', function () {
      Socket.removeListener('checkinChannel')
      Socket.removeListener('lockedChannel')
      Socket.removeListener('unlockedChannel')
    })

      // socket listener for candidate      
    Socket.on('lockedChannel', function (candidate) {
      vm.candidates.forEach((c) => {
        if (c._id.toString() === candidate._id.toString()) {
          console.log('display locked')
          c.lockedBy = candidate.lockedBy
        }
      })
    })

    // socket listener for candidate      
    Socket.on('unlockedChannel', function (candidate) {
      vm.candidates.forEach((c) => {
        if (c._id.toString() === candidate._id.toString()) {
          console.log('display locked')
          c.lockedBy = null
        }        
      })      
    })


  }
}());
