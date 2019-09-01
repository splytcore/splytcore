(function () {
  'use strict';

  // Shopifies controller
  angular
    .module('shopifies')
    .controller('ShopifiesController', ShopifiesController);

  ShopifiesController.$inject = ['$scope', '$state', '$window', 'Authentication', 'shopifyResolve', 'ShopifiesManagerService'];

  function ShopifiesController ($scope, $state, $window, Authentication, shopify, ShopifiesManagerService) {
    var vm = this;

    vm.authentication = Authentication;
    vm.shopify = shopify;
    vm.error = null;
    vm.form = {};
    vm.remove = remove;
    vm.save = save;
    vm.pullInventory = pullInventory;
    vm.products = null;

    function pullInventory() {
      ShopifiesManagerService.pullInventory(vm.shopify._id)
      .success(products => {
        console.log(products)
        vm.products = products
        for(var i = 0; i < products.length - 1; i++) {
          console.log(products[i])
        }
      })
      .error((err) => {
        vm.error = err.data.message
      })
    }

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

      

      //TODO: move create/update logic to service
      if (vm.shopify._id) {
        vm.shopify.$update(successCallback, errorCallback);
      } else {
        vm.shopify.$save(successCallback, errorCallback);
      }

      function successCallback(res) {
        console.log(res)
        const nounce = Math.floor(Math.random() * (10000000000 - 1)) + 1
        var authUrl = 'https://' + res.shopName + '.myshopify.com/admin/oauth/authorize?client_id=2220c6c1c526573175d54b9bd4f18a6d&redirect_uri=http://localhost:3000/shopifies&scope=write_inventory,read_products&state=' + nounce
        console.log(authUrl)
        $window.location = authUrl
      }

      function errorCallback(res) {
        vm.error = res.data.message;
      }
    }
  }
}());
