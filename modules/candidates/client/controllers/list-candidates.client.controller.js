(function () {
  'use strict';

  angular
    .module('candidates')
    .controller('CandidatesListController', CandidatesListController);

  CandidatesListController.$inject = ['$filter', 'CandidatesService', 'PositionsService', 'DepartmentsService', 'Socket', '$scope'];

  function CandidatesListController($filter, CandidatesService, PositionsService, DepartmentsService, Socket, $scope) {
    var vm = this
    vm.applyFilters = applyFilters

    vm.findCandidate = findCandidate
    vm.sortKey = 'lastName'
    vm.sortReverse = false


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

    CandidatesService.list()
      .success((res) => {                  
        vm.candidates = $filter('orderBy')(res, vm.sortKey, vm.sortReverse)
        vm.buildPager()
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
          vm.buildPager()
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
      vm.candidates.push(candidate)
      vm.buildPager()
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
