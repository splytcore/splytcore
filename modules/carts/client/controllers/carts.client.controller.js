(function () {
  'use strict';

  // Carts controller
  angular
    .module('carts')
    .controller('CartsController', CartsController);

  CartsController.$inject = ['$cookies', '$scope', '$state', '$window', 'Authentication', 'CartsService'];

  function CartsController ($cookies, $scope, $state, $window, Authentication, CartsService) {
    var vm = this;

    vm.authentication = Authentication;
    
    console.log('cart id: ' + $cookies.cartId)

    if ($cookies.cartId) {
      vm.cart = CartsService.get({ cartId: $cookies.cartId })
    } else {
      vm.cart = new CartsService()
    }

    console.log(vm.cart)

    vm.error = null;
    vm.form = {};
    vm.remove = remove;
    vm.save = save;

    // Remove existing Cart
    function remove() {
      if ($window.confirm('Are you sure you want to delete?')) {
        vm.cart.$remove($state.go('carts.checkout'));
        delete $cookies.cartId
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
