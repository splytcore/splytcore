// Candidates service used to communicate Candidates REST endpoints
(function () {
  'use strict';

  angular
    .module('candidates')
    .service('ReviewsService', ReviewsService);

  ReviewsService.$inject = ['$http'];

  function ReviewsService($http) {
    let vm = this
    vm.get = get        
    vm.remove = remove
    vm.create = create
    vm.update = update

    vm.url = '/api/candidates/' 

    function remove (candidateId) {      
      return $http.delete(vm.url + candidateId + '/review')
    }

    function update (candidateId, review) {      
      return $http.put(vm.url + candidateId + '/review', review)
    }

    function get (candidateId) {      
      return $http.get(vm.url + candidateId + '/review')
    }

    function create(candidateId, review) {
      return $http.post(vm.url + candidateId + '/review', review)      
    }

  }
}());
