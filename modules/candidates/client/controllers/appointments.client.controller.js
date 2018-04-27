(function () {
  'use strict';

  // Candidates controller
  angular
    .module('candidates')
    .controller('AppointmentsController', AppointmentsController);

  AppointmentsController.$inject = ['$scope', '$state', '$window', 'Authentication', 'AppointmentsService', 'CandidatesService', 'DepartmentsService']

  function AppointmentsController ($scope, $state, $window, Authentication, AppointmentsService, CandidatesService, DepartmentsService) {
    
    var vm = this
    vm.authentication = Authentication

    vm.error = null
    vm.form = {}
    vm.remove = remove
    vm.update = update           
    vm.create = create
    vm.createSchedulesForAllDepts = createSchedulesForAllDepts
    vm.createScheduleByDept= createScheduleByDept

    vm.deleteSchedulesForAllDepts = deleteSchedulesForAllDepts
    vm.deleteScheduleByDept= deleteScheduleByDept

    if ($state.params.appointmentId) {
      AppointmentsService.get($state.params.appointmentId)
        .success((res) => {          
          vm.appointment = res          
        })
        .error((res) => {          
          console.log(res)
        })        
    } 


    DepartmentsService.list()
      .success((res) => {
        // console.log(res)
        vm.departments = res
      })
      .error((err) => {
        console.log(err)
      })        

    // Remove existing Candidate
    function remove() {
      if ($window.confirm('Are you sure you want to delete?')) {        
        AppointmentsService.remove(vm.appointment._id)
          .success((res) => {
            // console.log(res) 
            vm.success = res.message                 
            
          })
          .error((res) => {
            console.log('failure')
            vm.error = res.message
          })        
      }
    }

    function create() {      
      AppointmentsService.create(vm.appointment)
        .success((res) => {
          // console.log(res) 
          vm.success = res.message                             
        })
        .error((res) => {
          console.log('failure')
          vm.error = res.message
        })  

    }

    function update() {

      AppointmentsService.update(vm.appointment)
        .success((res) => {
          // console.log(res)
          vm.success = res.message
        })
        .error((res) => {
          console.log('failure')
          vm.error = res.message
        })  

    }

    function createSchedulesForAllDepts() {
      if ($window.confirm('Are you sure you want to generate new appointments for all departments?')) {        
        AppointmentsService.createSchedulesForAllDepts()
          .success((res) => {
            // console.log(res)
            vm.success = res.message
          })
          .error((res) => {
            console.log('failure')
            vm.error = res.message
          })  
      }
    }

    function createScheduleByDept() {
      if (!vm.department) {
        return vm.error = 'please select department'
      }

      if ($window.confirm('Are you sure you want to generate new appointments for this department?')) {        
        AppointmentsService.createScheduleByDept(vm.department._id)
          .success((res) => {
            // console.log(res)
            vm.success = res.message
          })
          .error((res) => {
            console.log('failure')
            vm.error = res.message
          })  
      }
    }


    function deleteSchedulesForAllDepts() {
      if ($window.confirm('Are you sure you want to delete ALL existing appointments?')) {        
        AppointmentsService.deleteSchedulesForAllDepts()
          .success((res) => {
            // console.log(res)
            vm.success = res.message
          })
          .error((res) => {
            console.log('failure')
            vm.error = res.message
          })  
      }
    }

    function deleteScheduleByDept() {      

      if (!vm.department) {
        return vm.error = 'please select department'
      }

      if ($window.confirm('Are you sure you want to delete existing appointments for this department?')) {        
        AppointmentsService.deleteScheduleByDept(vm.department._id)
          .success((res) => {
            // console.log(res)
            vm.success = res.message
          })
          .error((res) => {
            console.log('failure')
            vm.error = res.message
          })  
      }
    }


  }
}());
