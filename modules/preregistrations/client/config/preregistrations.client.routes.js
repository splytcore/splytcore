(function () {
  'use strict';

  angular
    .module('preregistrations')
    .config(routeConfig);

  routeConfig.$inject = ['$stateProvider'];

  function routeConfig($stateProvider) {
    $stateProvider
      .state('preregistrations', {
        abstract: true,
        url: '/preregistrations',
        template: '<ui-view/>'
      })
      .state('preregistrations.list', {
        url: '',
        templateUrl: 'modules/preregistrations/client/views/list-preregistrations.client.view.html',
        controller: 'PreregistrationsListController',
        controllerAs: 'vm',
        data: {
          pageTitle: 'Preregistrations List'
        }
      })
      .state('preregistrations.create', {
        url: '/create',
        templateUrl: 'modules/preregistrations/client/views/form-preregistration.client.view.html',
        controller: 'PreregistrationsController',
        controllerAs: 'vm',
        resolve: {
          preregistrationResolve: newPreregistration
        },
        data: {
          roles: ['user', 'admin'],
          pageTitle: 'Preregistrations Create'
        }
      })
      .state('preregistrations.edit', {
        url: '/:preregistrationId/edit',
        templateUrl: 'modules/preregistrations/client/views/form-preregistration.client.view.html',
        controller: 'PreregistrationsController',
        controllerAs: 'vm',
        resolve: {
          preregistrationResolve: getPreregistration
        },
        data: {
          roles: ['user', 'admin'],
          pageTitle: 'Edit Preregistration {{ preregistrationResolve.name }}'
        }
      })
      .state('preregistrations.view', {
        url: '/:preregistrationId',
        templateUrl: 'modules/preregistrations/client/views/view-preregistration.client.view.html',
        controller: 'PreregistrationsController',
        controllerAs: 'vm',
        resolve: {
          preregistrationResolve: getPreregistration
        },
        data: {
          pageTitle: 'Preregistration {{ preregistrationResolve.name }}'
        }
      });
  }

  getPreregistration.$inject = ['$stateParams', 'PreregistrationsService'];

  function getPreregistration($stateParams, PreregistrationsService) {
    return PreregistrationsService.get({
      preregistrationId: $stateParams.preregistrationId
    }).$promise;
  }

  newPreregistration.$inject = ['PreregistrationsService'];

  function newPreregistration(PreregistrationsService) {
    return new PreregistrationsService();
  }
}());
