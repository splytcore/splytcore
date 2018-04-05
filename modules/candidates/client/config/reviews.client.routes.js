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
      .state('reviews.view', {
        url: '/:candidateId',
        templateUrl: 'modules/candidates/client/views/review-form-candidate.client.view.html',
        controller: 'ReviewController',
        controllerAs: 'vm',
        data: {          
          pageTitle: 'Review Candidates'
        }
      })
  }

}());
