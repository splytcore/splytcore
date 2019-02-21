(function () {
  'use strict'

  angular
    .module('sellers')
    .controller('SellerAssetsController', SellerAssetsController)

  SellerAssetsController.$inject = ['$http', '$state', 'Authentication']

  function SellerAssetsController($http, $state, Authentication) {
    var vm = this
    vm.user = Authentication.user

    $http.get('api/assets/mine')
      .then((result) => {
        vm.assets = result.data
      })
      .catch((err) => {
        alert(err)
      })
  }
}())
