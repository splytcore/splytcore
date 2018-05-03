(function () {
  'use strict';

  // Candidates controller
  angular
    .module('candidates')
    .controller('AppointmentsListController', AppointmentsListController);

  AppointmentsListController.$inject = ['$scope', '$state', '$window', 'Authentication', 'AppointmentsService', 'DepartmentsService'];

  function AppointmentsListController ($scope, $state, $window, Authentication, AppointmentsService, DepartmentsService) {
    
    var vm = this;
    vm.authentication = Authentication;

    vm.error = null
    vm.form = {}
    vm.listByDepartment = listByDepartment

    vm.buildPager = function () {
      vm.pagedItems = []
      vm.itemsPerPage = 10
      vm.currentPage = 1
      vm.figureOutItemsToDisplay()
    };

    vm.figureOutItemsToDisplay = function () {
      let begin = ((vm.currentPage - 1) * vm.itemsPerPage)
      let end = begin + vm.itemsPerPage
      vm.pagedItems = vm.appointments.slice(begin, end)
    }

    vm.pageChanged = function () {      
      vm.figureOutItemsToDisplay()
    }


    AppointmentsService.list()
      .success((res) => {
        vm.appointments = res          
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

    function listByDepartment() {
      console.log('department: ' + vm.department._id)      
      AppointmentsService.listByDepartment(vm.department._id)
        .success((res) => {
          vm.appointments = res 
          vm.buildPager()         
        })
        .error((res) => {
          console.log('failure')
          console.log(res)
        })  

    }
  }
}());
