(function () {
  'use strict';

  angular
    .module('rewards')
    .controller('RewardsListController', RewardsListController);

  RewardsListController.$inject = ['RewardsService'];

  function RewardsListController(RewardsService) {
    var vm = this;

    vm.rewards = RewardsService.query();
  }
}());
