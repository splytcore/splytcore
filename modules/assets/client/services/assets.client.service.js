// Rewards service used to communicate Rewards REST endpoints
(function () {
  'use strict';

  angular
    .module('assets')
    .service('AssetsService', AssetsService);

  AssetsService.$inject = ['$http'];

  function AssetsService($http) {

    let vm = this
    vm.get = get        
    vm.remove = remove
    vm.create = create    
    vm.update = update
    vm.list = list

    vm.url = '/api/assets/' 

    function remove (id) {      
      return $http.delete(vm.url + id)
    }

    function update (json) {      
      return $http.put(vm.url + json._id, json)
    }

    function get (id) {      
      console.log(id)
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
