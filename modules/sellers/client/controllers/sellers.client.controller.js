(function () {
  'use strict';

  // Sellers Dashboard controller
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

    vm.assets = AssetsService.query({ user: vm.user._id })
    vm.asset = new AssetsService()

    vm.categories = CategoriesService.query()

    console.log(vm.categories)


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
      vm.asset.$save(successCallback, errorCallback);

      function successCallback(res) {
        // alert('Successfull!')
        vm.success = 'Asset has been listed!'
        // vm.assets = AssetsService.query({ user: vm.user._id })
        $state.go('assets.edit', { assetId: res._id })
      }

      function errorCallback(res) {
        vm.error = res.data.message;
      }
    }
  }
}());
