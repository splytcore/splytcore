(function () {
  'use strict';

  angular
    .module('candidates')
    .controller('CandidatesQueueController', CandidatesQueueController);

  CandidatesQueueController.$inject = ['CandidatesService', 'Socket', '$scope'];

  function CandidatesQueueController(CandidatesService, Socket, $scope) {
    var vm = this
    vm.findCandidate = findCandidate    
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
      Socket.connect();
    }

    // event listener for new checkins
    Socket.on('checkinSocket', function (message) {
      console.log(message)
      listCheckins() //refresh page
    });

    // Remove the event listener when the controller instance is destroyed
    $scope.$on('$destroy', function () {
      Socket.removeListener('checkinSocket');
    });



  }
}());
