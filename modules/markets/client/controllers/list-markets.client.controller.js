(function () {
  'use strict';

  angular
    .module('markets')
    .controller('MarketsListController', MarketsListController);

  MarketsListController.$inject = ['MarketsService'];

  function MarketsListController(MarketsService) {
    var vm = this;

    vm.markets = MarketsService.query();
  }
}());
