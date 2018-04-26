(function () {
  'use strict';

  angular
    .module('candidates')
    .config(routeConfig);

  routeConfig.$inject = ['$stateProvider'];

  function routeConfig($stateProvider) {
    $stateProvider
      .state('reviews', {
        abstract: true,        
        url: '/reviews',
        template: '<ui-view/>'
      })
      .state('reviews.list', {
        url: '',
        templateUrl: 'modules/candidates/client/views/list-reviews.client.view.html',
        controller: 'ReviewsListController',
        controllerAs: 'vm',
        data: {          
          pageTitle: 'Review Candidates',
          roles: ['admin','user']
        }
      })
      .state('reviews.edit', {
        url: '/:candidateId/edit',
        templateUrl: 'modules/candidates/client/views/form-review.client.view.html',
        controller: 'ReviewsController',
        controllerAs: 'vm',
        data: {          
          pageTitle: 'Review Candidates',
          roles: ['admin','user']
        }
      })

  }

}());
