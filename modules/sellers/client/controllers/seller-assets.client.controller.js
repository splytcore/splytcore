(function () {
  'use strict'

  angular
    .module('sellers')
    .controller('SellerAssetsController', SellerAssetsController)

  SellerAssetsController.$inject = ['AssetsService', '$state']

  function SellerAssetsController(AssetsService, $state) {
    var vm = this

    vm.assets = AssetsService.query()
  }
}())
