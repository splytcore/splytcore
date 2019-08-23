(function () {
  'use strict';

  // Shopifies controller
  angular
    .module('shopifies')
    .controller('ShopifiesController', ShopifiesController);

  ShopifiesController.$inject = ['$scope', '$state', '$window', 'Authentication', 'shopifyResolve'];

  function ShopifiesController ($scope, $state, $window, Authentication, shopify) {
    var vm = this;

    vm.authentication = Authentication;
    vm.shopify = shopify;
    vm.error = null;
    vm.form = {};
    vm.remove = remove;
    vm.save = save;

    // Remove existing Shopify
    function remove() {
      if ($window.confirm('Are you sure you want to delete?')) {
        vm.shopify.$remove($state.go('shopifies.list'));
      }
    }

    // Save Shopify
    function save(isValid) {
      if (!isValid) {
        $scope.$broadcast('show-errors-check-validity', 'vm.form.shopifyForm');
        return false;
      }

      // TODO: move create/update logic to service
      if (vm.shopify._id) {
        vm.shopify.$update(successCallback, errorCallback);
      } else {
        vm.shopify.$save(successCallback, errorCallback);
      }

      function successCallback(res) {
        $state.go('shopifies.view', {
          shopifyId: res._id
        });
      }

      function errorCallback(res) {
        vm.error = res.data.message;
      }
    }
  }
}());
