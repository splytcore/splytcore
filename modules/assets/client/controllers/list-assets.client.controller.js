(function () {
  'use strict';

  angular
    .module('assets')
    .controller('AssetsListController', AssetsListController);

  AssetsListController.$inject = ['AssetsService', 'EthService'];

  function AssetsListController(AssetsService, EthService) {
    var vm = this;

    AssetsService.list()
      .success((res) => {          
        vm.assets = res          
      })
      .error((res) => {          
        console.log(res)
      })      
    
  }
}());
