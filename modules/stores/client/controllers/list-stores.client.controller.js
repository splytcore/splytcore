(function () {
  'use strict';

  angular
    .module('stores')
    .controller('StoresListController', StoresListController);

  StoresListController.$inject = ['StoresService'];

  function StoresListController(StoresService) {
    var vm = this;

    vm.stores = StoresService.query();
  }
}());
