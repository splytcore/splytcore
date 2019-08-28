(function () {
  'use strict';

  angular
    .module('shopifies')
    .controller('ShopifiesListController', ShopifiesListController);

  ShopifiesListController.$inject = ['ShopifiesService', '$location', 'shopifyResolve'];

  function ShopifiesListController(ShopifiesService, $location, shopify) {
    var vm = this;
    console.log($location.search())
    if($location.search().code && $location.search().shop){
      vm.shopify = shopify
      vm.shopify.accessToken = $location.search().code
      vm.shopify.shopName = $location.search().shop
      vm.shopify.$update(successCallback, errorCallback);
    }
    function successCallback(res) {
      console.log(res)
      vm.shopifies = [res]
    }

    function errorCallback(res) {
      vm.error = res.data.message;
    }

    vm.shopifies = ShopifiesService.query();

  }
}());
