(function () {
  'use strict';

  // Carts controller
  angular
    .module('carts')
    .controller('CartsController', CartsController);

  CartsController.$inject = ['$cookies', '$scope', '$state', '$window', 'Authentication', 'CartsService', 'cartResolve'];

  function CartsController ($cookies, $scope, $state, $window, Authentication, CartsService, cart) {
    var vm = this;

    vm.authentication = Authentication;
    
    vm.cart = cart

    console.log(vm.cart)

    vm.error = null;
    vm.form = {};
    vm.remove = remove;

    // Remove existing Cart
    function remove() {
      if ($window.confirm('Are you sure you want to delete?')) {
        vm.cart.$remove($state.go('cart.checkout'));
        delete $cookies.cartId
      }
    }

  }
}());
