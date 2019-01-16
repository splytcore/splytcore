(function () {
  'use strict';

  // Affiliates controller
  angular
    .module('affiliates')
    .controller('AffiliatesController', AffiliatesController);

  AffiliatesController.$inject = ['$scope', '$state', '$window', 'Authentication'];

  function AffiliatesController ($scope, $state, $window, Authentication) {
    var vm = this;

    vm.authentication = Authentication;
    vm.user = vm.authentication.user;
    vm.error = null;
    vm.form = {};

  }
}());
