(function () {
  'use strict';

  angular
    .module('candidates')
    .config(routeConfig);

  routeConfig.$inject = ['$stateProvider'];

  function routeConfig($stateProvider) {
    $stateProvider
      .state('appointments', {
        abstract: true,        
        template: '<ui-view/>'
      })
      .state('appointments.list', {
        url: '/appointments',
        templateUrl: 'modules/candidates/client/views/list-appointments.client.view.html',
        controller: 'AppointmentsListController',
        controllerAs: 'vm',
        data: {          
          pageTitle: 'Review Candidates'
        }
      })      
      .state('appointments.edit', {
        url: '/appointments/:appointmentId',
        templateUrl: 'modules/candidates/client/views/form-appointment.client.view.html',
        controller: 'AppointmentsController',
        controllerAs: 'vm',
        data: {          
          pageTitle: 'Review Candidates'
        }
      })
  }

}());
