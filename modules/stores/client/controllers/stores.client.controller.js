(function () {
  'use strict';

  // Stores controller
  angular
    .module('stores')
    .controller('StoresController', StoresController);

  StoresController.$inject = ['$cookies','$scope', '$state', '$window', 'Authentication', 'storeResolve', 'CategoriesService', 'AssetsService', 'StoreAssetsService'];

  function StoresController ($cookies, $scope, $state, $window, Authentication, store, CategoriesService, AssetsService, StoreAssetsService) {
    var vm = this

    vm.authentication = Authentication
    vm.store = store
  
    $cookies.storeId = vm.store._id ? vm.store._id : null

    console.log(store)
    vm.assets = vm.store._id ? vm.store.storeAssets.map(storeAsset => storeAsset.asset) : []
    console.log(vm.assets)    

    vm.error = null
    vm.form = {};
    vm.remove = remove;
    vm.save = save;

    // Remove existing Store
    function remove() {
      if ($window.confirm('Are you sure you want to delete?')) {
        vm.store.$remove($state.go('stores.list'));
      }
    }

    // Save Store
    function save(isValid) {
      if (!isValid) {
        $scope.$broadcast('show-errors-check-validity', 'vm.form.storeForm');
        return false;
      }

      // TODO: move create/update logic to service
      if (vm.store._id) {
        vm.store.$update(successCallback, errorCallback);
      } else {
        vm.store.$save(successCallback, errorCallback);
        vm.assets = AssetsService.query()
      }

      function successCallback(res) {
        $state.go('affiliates.storesEdit', {
          storeId: res._id
        });
      }

      function errorCallback(res) {
        vm.error = res.data.message;
      }
    }
  }
}());
