(function () {
  'use strict';

  angular
    .module('assets')
    .controller('AssetsListController', AssetsListController);

  AssetsListController.$inject = ['AssetsService', 'EthService', '$state', 'Authentication'];

  function AssetsListController(AssetsService, EthService, $state, Authentication) {
    var vm = this;

    vm.user = Authentication.user
    vm.wallet = $state.current.name.indexOf('assets.listMyAssets') > -1 ? vm.user.publicKey : null
    vm.assets = AssetsService.query({ wallet: vm.wallet })
 
  }
}());
