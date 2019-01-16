(function () {
  'use strict';

  // Sellers controller
  angular
    .module('sellers')
    .controller('SellersController', SellersController);

  SellersController.$inject = ['$scope', '$state', '$window', 'Authentication', 'AssetsService', 'CategoriesService'];

  function SellersController ($scope, $state, $window, Authentication, AssetsService, CategoriesService) {
    var vm = this;

    vm.user = Authentication.user;
    vm.error = null
    vm.form = {}
    vm.remove = remove
    vm.create = create

    vm.assets = AssetsService.query({ listType: 'ASSETS.LISTMYASSETS' })
    vm.asset = new AssetsService()

    vm.categories = CategoriesService.query().$promise


    console.log('categories: ' + vm.categories)


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
        vm.assets = AssetsService.query({ listType: 'ASSETS.LISTMYASSETS' })
      }

      function errorCallback(res) {
        vm.error = res.data.message;
      }
    }
  }
}());
