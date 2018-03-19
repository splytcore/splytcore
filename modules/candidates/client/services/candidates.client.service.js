// Candidates service used to communicate Candidates REST endpoints
(function () {
  'use strict';

  angular
    .module('candidates')
    .service('CandidatesService', CandidatesService);

  CandidatesService.$inject = ['$http'];

  function CandidatesService($http) {
    let vm = this
    vm.get = get    
    vm.list = list
    vm.register = register
    vm.checkin = checkin
    vm.findByEmail = findByEmail
    vm.listCheckins = listCheckins    
    vm.listByFilters = listByFilters

    vm.listEnumStages = listEnumStages
    vm.listEnumStatuses = listEnumStatuses
    vm.findCandidate = findCandidate

    vm.update = update
    vm.url = '/api/candidates/'

    function listEnumStages () {      
      return $http.get('/api/enum/candidates/stages')
    }

    function listEnumStatuses () {      
      return $http.get('/api/enum/candidates/statuses')
    }
    
    function update (candidate, note) {      
      return $http.put(vm.url + candidate._id, { candidate: candidate, note: note })
    }

    function get (candidateId) {      
      return $http.get(vm.url + candidateId)
    }

    function list () {      
      return $http.get(vm.url)
    }

    function register (candidate) {      
      console.log(candidate)
      return $http.post('/api/register', candidate)
    }

    function checkin (email) {
      return $http.post('/api/checkin', { email: email })      
    }

    function findByEmail (email) {
      return $http.get('/api/candidates?email='+email)      
    }

    function listCheckins () {
      return $http.get('/api/candidates?stage=QUEUE&sort=appointment')      
    }

    function listByFilters(filters) {
      return $http.get('/api/candidates?' + filters)      
    }

    function findCandidate(query) {
      return $http.get('/api/findCandidate?q=' + query)      
    }

    function uploadResume(file) {
      return $http.post('/api/candidates/uploadResume', file)      
    }


  }
}());
