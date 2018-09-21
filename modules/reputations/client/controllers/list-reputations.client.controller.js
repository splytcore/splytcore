(function () {
  'use strict';

  angular
    .module('reputations')
    .controller('ReputationsListController', ReputationsListController);

  ReputationsListController.$inject = ['ReputationsService', 'Authentication', '$state'];

  function ReputationsListController(ReputationsService, Authentication, $state) {
    var vm = this;

    vm.user = Authentication.user

    vm.wallet = $state.current.name.indexOf('reputations.listMyReputations') > -1 ? vm.user.publicKey : null
    vm.reputations = ReputationsService.query({ wallet: vm.wallet })

  }
}());
