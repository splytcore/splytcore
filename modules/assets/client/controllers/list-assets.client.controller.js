(function () {
  'use strict';

  angular
    .module('assets')
    .controller('AssetsListController', AssetsListController);

  AssetsListController.$inject = ['AssetsService', 'EthService', '$state', 'Authentication'];

  function AssetsListController(AssetsService, EthService, $state, Authentication) {
    var vm = this;
    vm.listType = $state.current.name.toString()
    vm.assets = AssetsService.query({ listType: vm.listType })
 
  }
}());
