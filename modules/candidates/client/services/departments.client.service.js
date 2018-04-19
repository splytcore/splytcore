// Candidates service used to communicate Candidates REST endpoints
(function () {
  'use strict';

  angular
    .module('candidates')
    .service('DepartmentsService', DepartmentsService)

  DepartmentsService.$inject = ['$http']

  function DepartmentsService($http) {
    let vm = this
    vm.get = get        
    vm.remove = remove
    vm.create = create
    vm.update = update
    vm.list = list

    vm.url = '/api/departments/' 

    function remove (id) {      
      return $http.delete(vm.url + id)
    }

    function update (json) {      
      return $http.put(vm.url + json._id, json)
    }

    function get (id) {      
      return $http.get(vm.url + id)
    }

    function list () {      
      return $http.get(vm.url)
    }

    function create(json) {
      return $http.post(vm.url, json)      
    }

  }
}());
