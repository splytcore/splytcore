(function () {
  'use strict';

  // Candidates controller
  angular
    .module('candidates')
    .controller('DepartmentsController', DepartmentsController);

  DepartmentsController.$inject = ['$scope', '$state', '$window', 'Authentication', 'PositionsService', 'DepartmentsService', 'AppointmentsService']

  function DepartmentsController ($scope, $state, $window, Authentication, PositionsService, DepartmentsService, AppointmentsService) {
    
    var vm = this
    vm.authentication = Authentication

    vm.error = null
    vm.form = {}
    vm.remove = remove
    vm.update = update           
    vm.create = create
    vm.createSchedule = createSchedule

    if ($state.params.departmentId) {
      DepartmentsService.get($state.params.departmentId)
        .success((res) => {          
          vm.department = res          
        })
        .error((res) => {          
          console.log(res)
        })  
    } 


    // Remove existing Candidate
    function remove() {
      if ($window.confirm('Are you sure you want to delete?')) {        
        DepartmentsService.remove(vm.department._id)
          .success((res) => {
            console.log(res) 
            vm.success = res.message                 
            $state.go('departments.list')
          })
          .error((res) => {
            console.log('failure')
            vm.error = res.message
          })        
      }
    }

    // checkin
    function create() {      
      DepartmentsService.create(vm.department)
        .success((res) => {
          console.log(res) 
          vm.success = res.message                             
        })
        .error((res) => {
          console.log('failure')
          vm.error = res.message
        })  

    }

    function update() {

      DepartmentsService.update(vm.department)
        .success((res) => {
          console.log(res)
          vm.success = res.message
        })
        .error((res) => {
          console.log('failure')
          vm.error = res.message
        })  

    }

    function createSchedule() {

      AppointmentsService.createSchedule(vm.department._id)
        .success((res) => {
          console.log(res)
          vm.success = res.message
        })
        .error((res) => {
          console.log('failure')
          vm.error = res.message
        })  
    }

  }
}());
