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
    vm.products = null;

    vm.pushBlockchain = () => {
      console.log('pushing to blockchain')
      ShopifiesManagerService.pushBlockchain(vm.shopify._id, vm.products.filter( product => {
        return product.selected 
      }))
      .success()
      .error((err) => {
        vm.error = err.data.message
      })
    }

    vm.selectProduct = (element) => {
      var productIndex = element.$index
      if(productIndex > -1)
        vm.products[productIndex].selected = true
      console.log(vm.products[productIndex])
    }

    vm.pullInventory = () => {
      ShopifiesManagerService.pullInventory(vm.shopify._id)
      .success(products => {
        vm.products = products
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
        const permissions = 'write_inventory,read_products,write_products'
        const currentDomain = $window.location.protocol + $window.location.host
        const clientId = '2220c6c1c526573175d54b9bd4f18a6d'
        var authUrl = 'https://'+res.shopName+'.myshopify.com/admin/oauth/authorize?client_id='+clientId+'&redirect_uri='+currentDomain +'/shopifies&scope='+permissions+'&state='+nounce
        console.log(authUrl)
        $window.location = authUrl
      }

      function errorCallback(res) {
        vm.error = res.data.message;
      }

    }
  }
}());
