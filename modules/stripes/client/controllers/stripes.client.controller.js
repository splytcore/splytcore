(function () {
  'use strict';

  // Stripes controller
  angular
    .module('stripes')
    .controller('StripesController', StripesController);

  StripesController.$inject = ['$scope', '$state', '$window', 'Authentication', 'stripeResolve'];

  function StripesController ($scope, $state, $window, Authentication, stripe) {
    var vm = this;

    vm.authentication = Authentication;
    vm.stripe = stripe;
    vm.error = null;
    vm.form = {};
    vm.remove = remove;
    vm.save = save;

    // Remove existing Stripe
    function remove() {
      if ($window.confirm('Are you sure you want to delete?')) {
        vm.stripe.$remove($state.go('stripes.list'));
      }
    }

    // Save Stripe
    function save(isValid) {
      if (!isValid) {
        $scope.$broadcast('show-errors-check-validity', 'vm.form.stripeForm');
        return false;
      }

      // TODO: move create/update logic to service
      if (vm.stripe._id) {
        vm.stripe.$update(successCallback, errorCallback);
      } else {
        vm.stripe.$save(successCallback, errorCallback);
      }

      function successCallback(res) {
        $state.go('stripes.view', {
          stripeId: res._id
        });
      }

      function errorCallback(res) {
        vm.error = res.data.message;
      }
    }

    // Create a Stripe client.
    var stripe = Stripe('pk_test_tZPTIhuELHzFYOV3STXQ34dv');

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
    var card = elements.create('card', {style: style});

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
