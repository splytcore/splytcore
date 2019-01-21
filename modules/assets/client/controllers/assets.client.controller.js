(function () {
  'use strict';

  // Assets controller
  angular
    .module('assets')
    .controller('AssetsController', AssetsController);

  AssetsController.$inject = ['CartsService', '$scope', '$state', '$window', 'Authentication', 'assetResolve', '$q', 'EthService', 'MarketsService', '$cookies', '$filter', 'CategoriesService'];

  function AssetsController (CartsService, $scope, $state, $window, Authentication, asset, $q, EthService, MarketsService, $cookies, $filter, CategoriesService) {
    var vm = this
    vm.save = save   
    vm.asset = asset

    vm.categories = CategoriesService.query()

    vm.remove = remove
    vm.user = Authentication.user
    vm.addToCart = addToCart
    vm.createCart = createCart

    console.log('cart id: ' + $cookies.cartId)

    function createCart(assetId, count) {
      let cart = new CartsService()
      
      // vm.store.$update((response) => {
      //   vm.success = true;
      // }, (error) => {
      //   vm.error = error.data.message
      // })


      cart.$save((result) => {
        console.log('success')
      }, (error) => {
        console.log('error')
      })

    }


    function addToCart(assetId, count) {

      let cart = new CartsService()
      
      // vm.store.$update((response) => {
      //   vm.success = true;
      // }, (error) => {
      //   vm.error = error.data.message
      // })


      cart.$save((result) => {
        console.log('success')
        console.log(result)
        $cookies.cartId = result._id
      }, (error) => {
        console.log('error')
      })

    }

    function save(isValid) {
      if (!isValid) {
        $scope.$broadcast('show-errors-check-validity', 'vm.form.assetForm');
        return false;
      }

      console.log(vm.asset)
      // TODO: move create/update logic to service
      vm.asset.marketPlaces = [vm.selectedMarketPlace]

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
