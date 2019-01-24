(function () {
  'use strict'

  angular
    .module('sellers')
    .controller('SellerAssetsController', SellerAssetsController)

  SellerAssetsController.$inject = ['AssetsService', '$state', 'Authentication']

  function SellerAssetsController(AssetsService, $state, Authentication) {
    var vm = this
    vm.user = Authentication.user

    vm.assets = AssetsService.query({ user: vm.user._id })
  
  }
}())
