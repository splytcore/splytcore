(function () {
  'use strict';

  angular
    .module('candidates')
    .controller('DepartmentsListController', DepartmentsListController);

  DepartmentsListController.$inject = ['DepartmentsService', 'Socket', '$scope'];

  function DepartmentsListController(DepartmentsService, Socket, $scope) {
    var vm = this    

    vm.buildPager = function () {
      vm.pagedItems = []
      vm.itemsPerPage = 10
      vm.currentPage = 1
      vm.figureOutItemsToDisplay()
    };

    vm.figureOutItemsToDisplay = function () {
      let begin = ((vm.currentPage - 1) * vm.itemsPerPage)
      let end = begin + vm.itemsPerPage
      vm.pagedItems = vm.departments.slice(begin, end)
    }

    vm.pageChanged = function () {      
      vm.figureOutItemsToDisplay()
    }


    DepartmentsService.list()
      .success((res) => {
        vm.departments = res
        vm.buildPager()
      })
      .error((res) => {
        console.log('failure')
        console.log(res)
      })

  }
}());
