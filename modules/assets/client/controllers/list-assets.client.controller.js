(function () {
  'use strict';

  angular
    .module('assets')
    .controller('AssetsListController', AssetsListController);

  AssetsListController.$inject = ['AssetsService', 'EthService'];

  function AssetsListController(AssetsService, EthService) {
    var vm = this;
    vm.assets = AssetsService.query();
    // EthService.getAssetsLength();
    
  }
}());
