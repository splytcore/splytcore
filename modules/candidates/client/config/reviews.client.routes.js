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
        template: '<ui-view/>'
      })
      .state('reviews.edit', {
        url: '/candidate/:candidateId',
        templateUrl: 'modules/candidates/client/views/form-review.client.view.html',
        controller: 'ReviewController',
        controllerAs: 'vm',
        data: {          
          pageTitle: 'Review Candidates'
        }
      })
  }

}());
