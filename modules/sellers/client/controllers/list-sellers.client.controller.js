(function () {
  'use strict';

  angular
    .module('sellers')
    .controller('SellersListController', SellersListController);

  SellersListController.$inject = ['SellersService', 'CategoriesService'];

  function SellersListController(SellersService, CategoriesService) {
    var vm = this

    vm.sellers = SellersService.query();

    vm.categories = CategoriesService.query();

    console.log(vm.categories)
    
  }
}());
