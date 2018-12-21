(function () {
  'use strict';

  // Sellers controller
  angular
    .module('sellers')
    .controller('SellersController', SellersController);

  SellersController.$inject = ['$scope', '$state', '$window', 'Authentication', 'AssetsService'];

  function SellersController ($scope, $state, $window, Authentication, AssetsService) {
    var vm = this;

    vm.authentication = Authentication;
    vm.error = null;
    vm.form = {};
    vm.remove = remove;
    vm.create = create

    vm.assets = AssetsService.query({ listType: 'ASSETS.LIST' })
    vm.asset = new AssetsService()

    // Remove existing Seller
    function remove() {
      if ($window.confirm('Are you sure you want to delete?')) {
        vm.seller.$remove($state.go('sellers.list'));
      }
    }

    // Save Seller
    function create(isValid) {
      console.log(isValid)
      if (!isValid) {
        $scope.$broadcast('show-errors-check-validity', 'vm.form.assetForm');
        return false;
      }
      console.log(vm.asset)
      //se default values
      vm.asset.term = 0
      vm.asset.marketPlaces = '0x2A8F9942129897019C5Ba80B1F1326AF7f814bC3'
      vm.asset.seller = vm.authentication.user.publicKey

      vm.asset.$save(successCallback, errorCallback);

      function successCallback(res) {
        alert('Successfull!')
      }

      function errorCallback(res) {
        vm.error = res.data.message;
      }
    }
  }
}());
