(function () {
  'use strict';

  angular
    .module('carts')
    .controller('CartsListController', CartsListController);

  CartsListController.$inject = ['CartsService'];

  function CartsListController(CartsService) {
    var vm = this;

    vm.carts = CartsService.query();
  }
}());
