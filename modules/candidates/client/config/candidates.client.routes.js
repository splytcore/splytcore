(function () {
  'use strict';

  angular
    .module('candidates')
    .config(routeConfig);

  routeConfig.$inject = ['$stateProvider'];

  function routeConfig($stateProvider) {
    $stateProvider
      .state('candidates', {
        abstract: true,
        url: '/candidates',
        template: '<ui-view/>'
      })
      .state('candidates.list', {
        url: '',
        templateUrl: 'modules/candidates/client/views/list-candidates.client.view.html',
        controller: 'CandidatesListController',
        controllerAs: 'vm',
        data: {
          roles: ['admin', 'user'],
          pageTitle: 'Candidates List'          
        }
      })
      .state('candidates.reviews', {
        url: '/reviews',
        templateUrl: 'modules/candidates/client/views/list-reviews.client.view.html',
        controller: 'ReviewsListController',
        controllerAs: 'vm',
        data: {
          roles: ['admin','user'],
          pageTitle: 'Reviews List'
        }
      })      
      .state('candidates.checkinQueue', {
        url: '/checkinQueue/:page/:limit',
        templateUrl: 'modules/candidates/client/views/list-queues.client.view.html',
        controller: 'QueuesListController',
        controllerAs: 'vm',
        data: {          
          pageTitle: 'Checkin Queue'
        }
      })      
      .state('candidates.register', {
        url: '/register',
        templateUrl: 'modules/candidates/client/views/form-register.client.view.html',
        controller: 'RegisterController',
        controllerAs: 'vm',
        data: {                    
          pageTitle: 'Candidates Register'
        }
      })
      .state('candidates.checkin', {
        url: '/checkin',
        templateUrl: 'modules/candidates/client/views/form-checkin.client.view.html',
        controller: 'CheckinController',
        controllerAs: 'vm',
        data: {          
          pageTitle: 'Candidates Checkin'
        }
      })      
      .state('candidates.edit', {
        url: '/:candidateId/edit',
        templateUrl: 'modules/candidates/client/views/form-candidate.client.view.html',
        controller: 'CandidatesController',
        controllerAs: 'vm',
        data: {          
          roles: ['admin','user'],
          pageTitle: 'Edit Candidate {{ candidateResolve.name }}'
        }
      })            
  }

  getCandidate.$inject = ['$stateParams', 'CandidatesService'];

  function getCandidate($stateParams, CandidatesService) {
    return CandidatesService.get({
      candidateId: $stateParams.candidateId
    }).$promise;
  }

  newCandidate.$inject = ['CandidatesService'];

  function newCandidate(CandidatesService) {
    return new CandidatesService();
  }
}());
