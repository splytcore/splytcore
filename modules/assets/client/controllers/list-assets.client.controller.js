(function () {
  'use strict';

  angular
    .module('assets')
    .controller('AssetsListController', AssetsListController);

  AssetsListController.$inject = ['AssetsService'];

  function AssetsListController(AssetsService) {
    var vm = this;
    vm.assets = AssetsService.query();
  }
}());
