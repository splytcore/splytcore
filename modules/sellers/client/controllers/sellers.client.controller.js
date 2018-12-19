(function () {
  'use strict';

  // Sellers controller
  angular
    .module('sellers')
    .controller('SellersController', SellersController);

  SellersController.$inject = ['$scope', '$state', '$window', 'Authentication'];

  function SellersController ($scope, $state, $window, Authentication) {
    var vm = this;

    vm.authentication = Authentication;
    vm.error = null;
    vm.form = {};
    vm.remove = remove;
    vm.save = save;

    // Remove existing Seller
    function remove() {
      if ($window.confirm('Are you sure you want to delete?')) {
        vm.seller.$remove($state.go('sellers.list'));
      }
    }

    // Save Seller
    function save(isValid) {
      if (!isValid) {
        $scope.$broadcast('show-errors-check-validity', 'vm.form.sellerForm');
        return false;
      }

      // TODO: move create/update logic to service
      if (vm.seller._id) {
        vm.seller.$update(successCallback, errorCallback);
      } else {
        vm.seller.$save(successCallback, errorCallback);
      }

      function successCallback(res) {
        $state.go('sellers.view', {
          sellerId: res._id
        });
      }

      function errorCallback(res) {
        vm.error = res.data.message;
      }
    }
  }
}());
