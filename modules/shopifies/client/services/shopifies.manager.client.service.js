(function () {
    'use strict';
  
    angular
      .module('shopifies')
      .service('ShopifiesManagerService', ShopifiesManagerService);
  
      ShopifiesManagerService.$inject = ['$http'];
  
    function ShopifiesManagerService($http) {
      let vm = this
      vm.baseURL = 'api/shopifies/'

      vm.pullInventory = pullInventory
    
      function pullInventory(shopifyId) {
  
        return $http.get(vm.baseURL + shopifyId + '/pull')
      }
    }
  }());
  