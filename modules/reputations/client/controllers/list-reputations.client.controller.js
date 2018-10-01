(function () {
  'use strict';

  angular
    .module('reputations')
    .controller('ReputationsListController', ReputationsListController);

  ReputationsListController.$inject = ['ReputationsService', 'Authentication', '$state'];

  function ReputationsListController(ReputationsService, Authentication, $state) {
    var vm = this;

    vm.user = Authentication.user

    vm.listType = $state.current.name.toString()

    vm.reputations = ReputationsService.query({ listType: vm.listType })

  }
}());
