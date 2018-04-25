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
                       
    AppointmentsService.list()
      .success((res) => {
        vm.appointments = res          
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
        })
        .error((res) => {
          console.log('failure')
          console.log(res)
        })  

    }
  }
}());
