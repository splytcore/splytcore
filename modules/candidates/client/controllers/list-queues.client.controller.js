(function () {
  'use strict';

  angular
    .module('candidates')
    .controller('QueuesListController', QueuesListController);

  QueuesListController.$inject = ['$filter', 'CandidatesService', 'Socket', '$scope', '$state']

  function QueuesListController($filter, CandidatesService, Socket, $scope, $state) {
    var vm = this    
    vm.listCheckins = listCheckins

    vm.sortKey = 'checkin'
    vm.sortReverse = false

    listCheckins()

    vm.sortData = function (sortKey){
      vm.sortKey = sortKey 
      vm.sortReverse = !vm.sortReverse
      vm.candidates = $filter('orderBy')(vm.candidates, vm.sortKey, vm.sortReverse)
      vm.buildPager()
    }

    vm.buildPager = function () {
      vm.pagedItems = []
      vm.itemsPerPage = 10
      vm.currentPage = 1
      vm.figureOutItemsToDisplay()
    }

    vm.figureOutItemsToDisplay = function () {
      let begin = ((vm.currentPage - 1) * vm.itemsPerPage)
      let end = begin + vm.itemsPerPage
      vm.pagedItems = vm.candidates.slice(begin, end)
    }

    vm.pageChanged = function () {      
      vm.figureOutItemsToDisplay()
    }


    function listCheckins() { 
      let page = $state.params.page ? $state.params.page : 1
      let limit = $state.params.limit ? $state.params.limit : 10
      CandidatesService.listCheckins(page, limit)
        .success((res) => {
          // console.log(res)
          vm.candidates = $filter('orderBy')(res, vm.sortKey, vm.sortReverse)          
          vm.buildPager()
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
      vm.candidates.push(candidate)
      vm.buildPager()            
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
