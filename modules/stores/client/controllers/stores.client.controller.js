(function () {
  'use strict';

  // Stores controller
  angular
    .module('stores')
    .controller('StoresController', StoresController);

  StoresController.$inject = ['$scope', '$state', '$window', 'Authentication', 'storeResolve', 'CategoriesService'];

  function StoresController ($scope, $state, $window, Authentication, store, CategoriesService) {
    var vm = this;

    vm.authentication = Authentication;
    vm.store = store;
    console.log(vm.store.categories)
    vm.error = null;
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
      }

      function successCallback(res) {
        $state.go('stores.view', {
          storeId: res._id
        });
      }

      function errorCallback(res) {
        vm.error = res.data.message;
      }
    }
  }
}());
