(function () {
  'use strict';

  // Candidates controller
  angular
    .module('candidates')
    .controller('AppointmentsController', AppointmentsController);

  AppointmentsController.$inject = ['$scope', '$state', '$window', 'Authentication', 'AppointmentsService', 'CandidatesService']

  function AppointmentsController ($scope, $state, $window, Authentication, AppointmentsService, CandidatesService) {
    
    var vm = this
    vm.authentication = Authentication

    vm.error = null
    vm.form = {}
    vm.remove = remove
    vm.update = update           
    vm.create = create
    vm.createSchedulesForAllDepts = createSchedulesForAllDepts

    if ($state.params.appointmentId) {
      AppointmentsService.get($state.params.appointmentId)
        .success((res) => {          
          vm.appointment = res          
        })
        .error((res) => {          
          console.log(res)
        })        
    } 


    // Remove existing Candidate
    function remove() {
      if ($window.confirm('Are you sure you want to delete?')) {        
        AppointmentsService.remove(vm.appointment._id)
          .success((res) => {
            console.log(res) 
            vm.success = res.message                 
            $state.go('appointments.list')
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
          console.log(res) 
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
          console.log(res)
          vm.success = res.message
        })
        .error((res) => {
          console.log('failure')
          vm.error = res.message
        })  

    }

    function createSchedulesForAllDepts() {
      if ($window.confirm('Are you sure you want to delete existing appointments and generate new ones?')) {        
        AppointmentsService.createSchedulesForAllDepts()
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

  }
}());
