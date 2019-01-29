(function () {
  'use strict';

  // Carts controller
  angular
    .module('carts')
    .controller('CheckoutController', CheckoutController);

  CheckoutController.$inject = ['StoresService', '$location','AssetsService','$stateParams', '$cookies', '$scope', '$state', '$window', 'Authentication', 'CartsItemsService', 'CartsService', 'OrdersService'];

  function CheckoutController (StoresService, $location, AssetsService, $stateParams, $cookies, $scope, $state, $window, Authentication, CartsItemsService, CartsService, OrdersService) {
    var vm = this;

    vm.authentication = Authentication

    //NOTE: future we'll only haver the storeId
    vm.addAssetFromStoreId = addAssetFromStoreId

    vm.storeId = $location.search()['storeId']

    console.log('storeId:' + vm.storeId)

    vm.store =  vm.storeId ? StoresService.get({ storeId: vm.storeId }) : {}
    
    console.log(vm.store.name)
    
    console.log('cart id: ' + $cookies.cartId)

    //BUG HERE. Calculating incorrectly 
    if ($cookies.cartId) {
      CartsService.get({ cartId: $cookies.cartId }, (err, result) => {
        vm.cart = result
        if (vm.storeId) {
          addAssetFromStoreId(vm.storeId)
        } 
      })
    } else if (vm.storeId){
      addAssetFromStoreId(vm.storeId)
    }


    vm.error = null
    vm.form = {}
    vm.remove = remove
    vm.save = save
    vm.order = order

   // add asset if there's a hashtag
    function addAssetFromStoreId(storeId) {
        
      let cartItem = new CartsItemsService()
      cartItem.cart = $cookies.cartId
      cartItem.store = storeId
      cartItem.quantity = 1
      cartItem.$save((result) => {
         console.log(result)
         vm.cart = CartsService.get({ cartId: result.cart._id })
         console.log('updated card')
         $cookies.cartId = result.cart._id
         console.log(vm.cart)
      }, (error) => {
        console.log('error')
      })

    }

    // CreateOrder
    function order() {

      vm.order = new OrdersService()
      vm.order.cart = vm.cart._id

      vm.order.$save((result) => {
        console.log('new order created successful!')
        delete $cookies.cartId
      }, (error) => {
        console.log('error')
      })

    }

    // Remove existing Cart
    function remove() {
      if ($window.confirm('Are you sure you want to delete?')) {
        vm.cart.$remove($state.go('cart.checkout'));
        delete $cookies.cartId
        vm.totalQuantity = 0
        vm.totalCost = 0
      }
    }

    // Save Cart
    function save(isValid) {
      if (!isValid) {
        $scope.$broadcast('show-errors-check-validity', 'vm.form.cartForm');
        return false;
      }

      // TODO: move create/update logic to service
      if (vm.cart._id) {
        vm.cart.$update(successCallback, errorCallback);
      } else {
        vm.cart.$save(successCallback, errorCallback);
      }

      function successCallback(res) {
        $cookies.cartId = res._id

        $state.go('carts.checkout', {
          cartId: res._id
        });
      }

      function errorCallback(res) {
        vm.error = res.data.message;
      }
    }
  }
}());
