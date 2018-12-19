(function () {
  'use strict';

  angular
    .module('sellers')
    .controller('SellersListController', SellersListController);

  SellersListController.$inject = ['SellersService'];

  function SellersListController(SellersService) {
    var vm = this;

    vm.sellers = SellersService.query();
  }
}());
