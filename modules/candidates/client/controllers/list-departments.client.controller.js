(function () {
  'use strict';

  angular
    .module('candidates')
    .controller('DepartmentsListController', DepartmentsListController);

  DepartmentsListController.$inject = ['DepartmentsService', 'Socket', '$scope'];

  function DepartmentsListController(DepartmentsService, Socket, $scope) {
    var vm = this    


    DepartmentsService.list()
      .success((res) => {
        vm.departments = res
      })
      .error((res) => {
        console.log('failure')
        console.log(res)
      })

  }
}());
