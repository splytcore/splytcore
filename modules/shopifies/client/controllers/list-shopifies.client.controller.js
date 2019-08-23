(function () {
  'use strict';

  angular
    .module('shopifies')
    .controller('ShopifiesListController', ShopifiesListController);

  ShopifiesListController.$inject = ['ShopifiesService'];

  function ShopifiesListController(ShopifiesService) {
    var vm = this;

    vm.shopifies = ShopifiesService.query();
  }
}());
