// card number: 4242 4242 4242 4242
// exp month: 12
// exp year: 2020
// cvc: 123
(function () {
  'use strict';

  // Carts controller
  angular
    .module('carts')
    .controller('CheckoutController', CheckoutController);

  CheckoutController.$inject = ['StoresService', '$location','AssetsService','$stateParams', '$cookies', '$scope', '$state', '$window', 'Authentication', 'CartsItemsService', 'CartsService', 'OrdersService'];

  function CheckoutController (StoresService, $location, AssetsService, $stateParams, $cookies, $scope, $state, $window, Authentication, CartsItemsService, CartsService, OrdersService) {
    let vm = this
  
    let stripe

    // Test stripe API key
    /* jshint ignore:start */
    stripe = Stripe('pk_test_tZPTIhuELHzFYOV3STXQ34dv')
    /* jshint ignore:end */

    // Live stripe API key
    /* jshint ignore:start */
    // stripe = Stripe('pk_live_XxKvyPSzR7smz8stVkL1xc59')
    /* jshint ignore:end */

    let card

    vm.authentication = Authentication

    //NOTE: future we'll only haver the storeId
    vm.addAssetFromStoreId = addAssetFromStoreId

    vm.storeId = $location.search().storeId

    console.log('storeId:' + vm.storeId)

    vm.store =  vm.storeId ? StoresService.get({ storeId: vm.storeId }) : {}
    
    console.log(vm.store.name)
    
    console.log('cart id: ' + $cookies.cartId)

    //BUG HERE. Calculating incorrectly 
    if ($cookies.cartId) {
      vm.cart = CartsService.get({ cartId: $cookies.cartId })
      if (vm.storeId) {
        addAssetFromStoreId(vm.storeId)
      } 
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

      stripe.createToken(card)
      .then(res => {
        if (res.error) {
          // Inform the user if there was an error.
          var errorElement = document.getElementById('card-errors');
          errorElement.textContent = res.error.message;
        } else {
          // Send the token to your server.
          vm.order.stripeToken = res.token.id
          vm.order.totalCost = vm.totalCost
          console.log(res.token)
          vm.order.$save(res => {
            alert('new order created successful!')
            delete $cookies.cartId
            vm.cart = null
            vm.totalQuantity = 0
            vm.totalCost = 0
          }, (error) => {
            console.log('error')
          })
        }
      });

    }

    // Remove existing Cart
    function remove() {
      if ($window.confirm('Are you sure you want to delete?')) {
        delete $cookies.cartId
        vm.cart.$remove($state.go('cart.checkout'))
        vm.cart = null
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

    // Create an instance of Elements.
    var elements = stripe.elements();

    // Custom styling can be passed to options when creating an Element.
    // (Note that this demo uses a wider set of styles than the guide below.)
    var style = {
      base: {
        color: '#32325d',
        lineHeight: '18px',
        fontFamily: '"Helvetica Neue", Helvetica, sans-serif',
        fontSmoothing: 'antialiased',
        fontSize: '16px',
        '::placeholder': {
          color: '#aab7c4'
        }
      },
      invalid: {
        color: '#fa755a',
        iconColor: '#fa755a'
      }
    };

    // Create an instance of the card Element.
    card = elements.create('card', {style: style});

    // Add an instance of the card Element into the `card-element` <div>.
    card.mount('#card-element');

    // Handle real-time validation errors from the card Element.
    card.addEventListener('change', function(event) {
      var displayError = document.getElementById('card-errors');
      if (event.error) {
        displayError.textContent = event.error.message;
      } else {
        displayError.textContent = '';
      }
    });

    // Handle form submission.
    var form = document.getElementById('payment-form');
    form.addEventListener('submit', function(event) {
      event.preventDefault();

      stripe.createToken(card).then(function(result) {
        if (result.error) {
          // Inform the user if there was an error.
          var errorElement = document.getElementById('card-errors');
          errorElement.textContent = result.error.message;
        } else {
          // Send the token to your server.
          stripeTokenHandler(result.token);
        }
      });
    });

    // Submit the form with the token ID.
    function stripeTokenHandler(token) {
      console.log(token)
      // Insert the token ID into the form so it gets submitted to the server
      var form = document.getElementById('payment-form');
      var hiddenInput = document.createElement('input');
      hiddenInput.setAttribute('type', 'hidden');
      hiddenInput.setAttribute('name', 'stripeToken');
      hiddenInput.setAttribute('value', token.id);
      form.appendChild(hiddenInput);

      // Submit the form
      vm.stripe = form
      save()
    }
  }





}());
