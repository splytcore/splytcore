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
          pageTitle: 'Candidates List'
        }
      })
      .state('candidates.checkinQueue', {
        url: '/checkinQueue',
        templateUrl: 'modules/candidates/client/views/queue-candidates.client.view.html',
        controller: 'CandidatesQueueController',
        controllerAs: 'vm',
        data: {
          pageTitle: 'Checkin Queue'
        }
      })      
      .state('candidates.register', {
        url: '/register',
        templateUrl: 'modules/candidates/client/views/register-form-candidate.client.view.html',
        controller: 'RegisterController',
        controllerAs: 'vm',
        data: {          
          pageTitle: 'Candidates Register'
        }
      })
      .state('candidates.registrationSuccess', {
        url: '/registrationSuccess/:registeredFrom',
        templateUrl: 'modules/candidates/client/views/success-registration.client.view.html',
        controller: 'RegistrationCompleteController',
        controllerAs: 'vm'
      })            
      .state('candidates.checkin', {
        url: '/checkin',
        templateUrl: 'modules/candidates/client/views/checkin-form-candidate.client.view.html',
        controller: 'CandidatesCheckinController',
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
          pageTitle: 'Edit Candidate {{ candidateResolve.name }}'
        }
      })            
      .state('candidates.view', {
        url: '/:candidateId',
        templateUrl: 'modules/candidates/client/views/form-candidate.client.view.html',
        controller: 'CandidatesController',
        controllerAs: 'vm',
        data: {
          pageTitle: 'Candidate {{ candidateResolve.name }}'
        }
      })
      .state('candidates.uploadResume', {
        url: '/uploadResume/:email/:registeredFrom',
        templateUrl: 'modules/candidates/client/views/uploadResume-form-candidate.client.view.html',
        controller: 'UploadResumeController',
        controllerAs: 'vm',
        data: {          
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
