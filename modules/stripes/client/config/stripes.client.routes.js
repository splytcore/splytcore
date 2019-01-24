(function () {
  'use strict';

  angular
    .module('stripes')
    .config(routeConfig);

  routeConfig.$inject = ['$stateProvider'];

  function routeConfig($stateProvider) {
    $stateProvider
      .state('stripes', {
        abstract: true,
        url: '/stripes',
        template: '<ui-view/>'
      })
      .state('stripes.list', {
        url: '',
        templateUrl: 'modules/stripes/client/views/list-stripes.client.view.html',
        controller: 'StripesListController',
        controllerAs: 'vm',
        data: {
          roles: ['affiliate'],
          pageTitle: 'Stripes List'
        }
      })
      .state('stripes.create', {
        url: '/create',
        templateUrl: 'modules/stripes/client/views/form-stripe.client.view.html',
        controller: 'StripesController',
        controllerAs: 'vm',
        resolve: {
          stripeResolve: newStripe
        },
        data: {
          pageTitle: 'Stripes Create'
        }
      })
      .state('stripes.edit', {
        url: '/:stripeId/edit',
        templateUrl: 'modules/stripes/client/views/form-stripe.client.view.html',
        controller: 'StripesController',
        controllerAs: 'vm',
        resolve: {
          stripeResolve: getStripe
        },
        data: {
          roles: ['affiliate', 'admin'],
          pageTitle: 'Edit Stripe {{ stripeResolve.name }}'
        }
      })
      .state('stripes.view', {
        url: '/:stripeId',
        templateUrl: 'modules/stripes/client/views/view-stripe.client.view.html',
        controller: 'StripesController',
        controllerAs: 'vm',
        resolve: {
          stripeResolve: getStripe
        },
        data: {
          pageTitle: 'Stripe {{ stripeResolve.name }}'
        }
      });
  }

  getStripe.$inject = ['$stateParams', 'StripesService'];

  function getStripe($stateParams, StripesService) {
    return StripesService.get({
      stripeId: $stateParams.stripeId
    }).$promise;
  }

  newStripe.$inject = ['StripesService'];

  function newStripe(StripesService) {
    return new StripesService();
  }
}());
