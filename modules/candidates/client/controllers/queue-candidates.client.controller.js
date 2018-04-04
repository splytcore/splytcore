(function () {
  'use strict';

  angular
    .module('candidates')
    .controller('CandidatesQueueController', CandidatesQueueController);

  CandidatesQueueController.$inject = ['CandidatesService', 'Socket', '$scope']

  function CandidatesQueueController(CandidatesService, Socket, $scope) {
    var vm = this    
    vm.listCheckins = listCheckins

    listCheckins()

    function listCheckins() { 
      CandidatesService.listCheckins()
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
      listCheckins() //refresh page
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
