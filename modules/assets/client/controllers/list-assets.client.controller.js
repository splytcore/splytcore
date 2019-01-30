(function () {
  'use strict';

  angular
    .module('assets')
    .controller('AssetsListController', AssetsListController);

  AssetsListController.$inject = ['AssetsService', '$state', 'Authentication', '$cookies'];

  function AssetsListController(AssetsService, $state, Authentication, $cookies) {
    
    var vm = this;
    vm.listType = $state.current.name.toString()
    vm.assets = AssetsService.query()
    vm.etherscanURL = $cookies.etherscanURL
 
  }
}());
