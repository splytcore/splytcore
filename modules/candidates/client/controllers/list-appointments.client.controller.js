(function () {
  'use strict';

  // Candidates controller
  angular
    .module('candidates')
    .controller('AppointmentsListController', AppointmentsListController);

  AppointmentsListController.$inject = ['$scope', '$state', '$window', 'Authentication', 'AppointmentsService'];

  function AppointmentsListController ($scope, $state, $window, Authentication, AppointmentsService) {
    
    var vm = this;
    vm.authentication = Authentication;

    vm.error = null
    vm.form = {}

    AppointmentsService.list()
      .success((res) => {
        console.log(res)          
        vm.appointments = res          
      })
      .error((res) => {
        console.log('failure')
        console.log(res)
      })  
  }
}());
