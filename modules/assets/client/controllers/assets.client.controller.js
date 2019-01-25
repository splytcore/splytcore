(function () {
  'use strict';

  // Assets controller
  angular
    .module('assets')
    .controller('AssetsController', AssetsController);

  AssetsController.$inject = ['CartsService', 'CartsItemsService', '$scope', '$state', '$window', 'Authentication', 'assetResolve', '$q', '$cookies', '$filter', 'CategoriesService'];

  function AssetsController (CartsService, CartsItemsService,  $scope, $state, $window, Authentication, asset, $q, $cookies, $filter, CategoriesService) {
    var vm = this
    vm.save = save   
    vm.asset = asset

    vm.categories = CategoriesService.query()

    vm.remove = remove
    vm.user = Authentication.user
    vm.addToCart = addToCart

    console.log('cart id: ' + $cookies.cartId)

    function addToCart(assetId) {

      let cartItem = new CartsItemsService()
      cartItem.cart = $cookies.cartId
      cartItem.asset = assetId
      cartItem.quantity = vm.qty

      cartItem.$save((result) => {
        console.log('success')
        console.log(result)
        $cookies.cartId = result.cart._id
        alert('added to cart!')
      }, (error) => {
        console.log('error')
        vm.error = error
      })

    }

    function save(isValid) {
      if (!isValid) {
        $scope.$broadcast('show-errors-check-validity', 'vm.form.assetForm');
        return false;
      }

      console.log(vm.asset)
      // TODO: move create/update logic to service
   
      console.log(vm.asset)

      if (vm.asset._id) {
        vm.asset.$update(successCallback, errorCallback);
      } else {
        vm.asset.$save(successCallback, errorCallback);
      }

      function successCallback(asset) {  
        alert('updated!')
      }

      function errorCallback(res) {
        vm.error = res.data.message;
      }
    }

    function remove() {
      if ($window.confirm('Are you sure you want to delete?')) {
        vm.asset.$remove($state.go('assets.list'));
      }
    }

  }
}());
