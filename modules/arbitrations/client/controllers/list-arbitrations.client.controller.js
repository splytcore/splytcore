(function () {
  'use strict';

  angular
    .module('arbitrations')
    .controller('ArbitrationsListController', ArbitrationsListController);

  ArbitrationsListController.$inject = ['ArbitrationsService', 'Authentication', '$state', '$cookies'];

  function ArbitrationsListController(ArbitrationsService, Authentication, $state, $cookies) {
    var vm = this

    vm.user = Authentication.user
    
    vm.listType = $state.current.name.toString()

    vm.arbitrations = ArbitrationsService.query({ listType: vm.listType })

    vm.etherscanURL = $cookies.etherscanURL
	}
}());
