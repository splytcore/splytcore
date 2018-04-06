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
    vm.list = list

    vm.url = '/api/reviews/' 

    function remove (candidateId) {      
      return $http.delete(vm.url + candidateId)
    }

    function update (review) {      
      return $http.put(vm.url + review.candidate._id, review)
    }

    function get (candidateId) {      
      return $http.get(vm.url + candidateId)
    }

    function list () {      
      return $http.get(vm.url)
    }

    function create(candidateId, review) {
      return $http.post(vm.url + candidateId, review)      
    }

  }
}());
