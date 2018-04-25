// Candidates service used to communicate Candidates REST endpoints
(function () {
  'use strict';

  angular
    .module('candidates')
    .service('PositionsService', PositionsService);

  PositionsService.$inject = ['$http'];

  function PositionsService($http) {
    let vm = this
    vm.get = get        
    vm.remove = remove
    vm.create = create
    vm.update = update
    vm.list = list
    vm.listByDept = listByDept

    vm.url = '/api/positions/' 

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

    function listByDept (deptId) {      
      return $http.get(vm.url + '?department=' + deptId)
    }

    function create(json) {
      return $http.post(vm.url, json)      
    }

  }
}());
