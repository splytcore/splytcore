(function () {
  'use strict';

  angular
    .module('reputations')
    .controller('ReputationsListController', ReputationsListController);

  ReputationsListController.$inject = ['ReputationsService'];

  function ReputationsListController(ReputationsService) {
    var vm = this;

    vm.reputations = ReputationsService.query();
  }
}());
