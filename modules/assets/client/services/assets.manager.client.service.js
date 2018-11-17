// Rewards service used to communicate Rewards REST endpoints
(function () {
  'use strict';

  angular
    .module('assets')
    .service('AssetsManagerService', AssetsManagerService);

  AssetsManagerService.$inject = ['$http'];

  function AssetsManagerService($http) {
    let vm = this
    vm.getAssetByAddress = getAssetByAddress

    function getAssetByAddress(address) {
      return $http.get('api/assetByAddress/' + address)
    }


  }
}());
