(function () {
  'use strict'

  // Affiliates controller
  angular
    .module('affiliates')
    .controller('AffiliatesStoreController', AffiliatesStoreController)

  AffiliatesStoreController.$inject = ['$scope', '$state', '$window', 'Authentication', 'StoresService']

  function AffiliatesStoreController ($scope, $state, $window, Authentication, StoresService) {
    var vm = this

    vm.authentication = Authentication
    vm.user = vm.authentication.user
    
    // console.log(vm.user.categories)

    vm.stores = StoresService.query({ affiliate: vm.user._id })


  }
}());
