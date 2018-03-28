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
    // vm.register = register
    vm.checkin = checkin
    vm.findByEmail = findByEmail
    vm.listCheckins = listCheckins    
    vm.listByFilters = listByFilters

    vm.listEnumValues = listEnumValues
    vm.listAllEnumValues = listAllEnumValues    

    vm.findCandidate = findCandidate

    vm.update = update
    vm.url = '/api/candidates/'

    function listEnumValues (field) {      
      return $http.get('/api/enum/candidates/' + field)
    }

    function listAllEnumValues (field) {      
      return $http.get('/api/enum/candidates/')
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

    // function register (candidate) {      
    //   console.log(candidate)
    //   return $http.post('/api/register/' + candidate.registeredFrom, candidate)
    // }

    function checkin (email) {
      return $http.post('/api/checkin', { email: email })      
    }

    function findByEmail (email) {
      return $http.get('/api/candidateByEmail/'+email)      
    }

    function listCheckins () {
      return $http.get('/api/candidates?stage=QUEUE&sort=appointment')      
    }

    function listByFilters(filters) {
      return $http.get('/api/candidates?' + filters)      
    }

    function findCandidate(query) {
      return $http.get('/api/findCandidate/' + query)      
    }

  }
}());
