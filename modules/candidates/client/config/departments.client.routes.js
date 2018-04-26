(function () {
  'use strict';

  angular
    .module('candidates')
    .config(routeConfig);

  routeConfig.$inject = ['$stateProvider'];

  function routeConfig($stateProvider) {
    $stateProvider
      .state('departments', {
        url: '/departments',
        abstract: true,        
        template: '<ui-view/>'
      })
      .state('departments.list', {
        url: '',
        templateUrl: 'modules/candidates/client/views/list-departments.client.view.html',
        controller: 'DepartmentsListController',
        controllerAs: 'vm',
        data: {
          pageTitle: 'Positions List'
        }
      })      
      .state('departments.create', {
        url: '/create',
        templateUrl: 'modules/candidates/client/views/form-department.client.view.html',
        controller: 'DepartmentsController',
        controllerAs: 'vm',
        data: {          
          pageTitle: 'Positions'
        }
      })      
      .state('departments.edit', {
        url: '/:departmentId/edit',
        templateUrl: 'modules/candidates/client/views/form-department.client.view.html',
        controller: 'DepartmentsController',
        controllerAs: 'vm',
        data: {          
          pageTitle: 'Positions'
        }
      })
      .state('departments.manageAppointments', {
        url: '/manageAppointments',
        templateUrl: 'modules/candidates/client/views/form-manageAppointments.client.view.html',
        controller: 'AppointmentsController',
        controllerAs: 'vm',
        data: {          
          pageTitle: 'Positions'
        }
      })


  }

}());
