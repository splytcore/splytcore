(function () {
  'use strict';

  angular
    .module('candidates')
    .controller('PositionsListController', PositionsListController);

  PositionsListController.$inject = ['DepartmentsService', 'PositionsService', 'Socket', '$scope'];

  function PositionsListController(DepartmentsService, PositionsService, Socket, $scope) {
    var vm = this    
    vm.listByDept = listByDept


    vm.buildPager = function () {
      vm.pagedItems = []
      vm.itemsPerPage = 10
      vm.currentPage = 1
      vm.figureOutItemsToDisplay()
    };

    vm.figureOutItemsToDisplay = function () {
      let begin = ((vm.currentPage - 1) * vm.itemsPerPage)
      let end = begin + vm.itemsPerPage
      vm.pagedItems = vm.positions.slice(begin, end)
    }

    vm.pageChanged = function () {      
      vm.figureOutItemsToDisplay()
    }

    PositionsService.list()
      .success((res) => {
        vm.positions = res
        vm.buildPager()
      })
      .error((res) => {
        console.log('failure')
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


    function listByDept() {
      // console.log('departmetn: ' + vm.department)
      PositionsService.listByDept(vm.department._id)
        .success((res) => {
          vm.positions = res
        })
        .error((res) => {
          console.log('failure')
          console.log(res)
        })

    }

  }
}());
