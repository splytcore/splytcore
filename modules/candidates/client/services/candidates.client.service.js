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
    vm.remove = remove
    vm.list = list    
    // vm.register = register
    vm.checkin = checkin
    vm.findByEmail = findByEmail
    vm.listCheckins = listCheckins    
    vm.listByFilters = listByFilters

    vm.listEnumValues = listEnumValues
    vm.listAllEnumValues = listAllEnumValues    

    vm.findCandidate = findCandidate
    vm.unlock = unlock
    vm.lock = lock

    vm.update = update
    vm.url = '/api/candidates/'
    vm.listPositions = listPositions

    function remove (candidateId) {      
      return $http.delete('/api/candidates/' + candidateId)
    }

    function listPositions () {      
      return $http.get('/api/positions')
    }

    function listEnumValues (field) {      
      return $http.get('/api/enum/candidates/' + field)
    }

    function listAllEnumValues (field) {      
      return $http.get('/api/enum/candidates/')
    }
    
    function update (candidate) {      
      return $http.put(vm.url + candidate._id, candidate)
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

    function lock(candidateId) {
      return $http.get('/api/candidates/' + candidateId + '/lock')      
    }

    function unlock(candidateId) {
      return $http.get('/api/candidates/' + candidateId + '/unlock')      
    }

  }
}());
