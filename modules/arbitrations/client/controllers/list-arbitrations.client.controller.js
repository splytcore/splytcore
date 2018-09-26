(function () {
  'use strict';

  angular
    .module('arbitrations')
    .controller('ArbitrationsListController', ArbitrationsListController);

  ArbitrationsListController.$inject = ['ArbitrationsService', 'Authentication', '$state'];

  function ArbitrationsListController(ArbitrationsService, Authentication, $state) {
    var vm = this;

    vm.user = Authentication.user
    
    vm.wallet = $state.current.name.indexOf('arbitrations.listMyArbitrations') > -1 ? vm.user.publicKey : null
    vm.listPending = $state.current.name.indexOf('arbitrations.listPending') > -1 ? true : false

    vm.arbitrations = ArbitrationsService.query({ wallet: vm.wallet, listPending: vm.listPending })
	}
}());
