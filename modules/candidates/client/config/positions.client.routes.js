(function () {
  'use strict';

  angular
    .module('candidates')
    .config(routeConfig);

  routeConfig.$inject = ['$stateProvider'];

  function routeConfig($stateProvider) {
    $stateProvider
      .state('positions', {
        url: '/positions',
        abstract: true,        
        template: '<ui-view/>'
      })
      .state('positions.list', {
        url: '',
        templateUrl: 'modules/candidates/client/views/list-positions.client.view.html',
        controller: 'PositionsListController',
        controllerAs: 'vm',
        data: {
          roles: ['user', 'admin'],
          pageTitle: 'Positions List'
        }
      })      
      .state('positions.create', {
        url: '/create/',
        templateUrl: 'modules/candidates/client/views/form-position.client.view.html',
        controller: 'PositionsController',
        controllerAs: 'vm',
        data: {          
          roles: ['user', 'admin'],
          pageTitle: 'Positions'
        }
      })      
      .state('positions.edit', {
        url: '/:positionId/edit',
        templateUrl: 'modules/candidates/client/views/form-position.client.view.html',
        controller: 'PositionsController',
        controllerAs: 'vm',
        data: {          
          pageTitle: 'Positions',
          roles: ['user', 'admin']
        }
      })

  }

}());
