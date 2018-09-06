(function () {
  'use strict';

  angular
    .module('arbitrations')
    .controller('ArbitrationsListController', ArbitrationsListController);

  ArbitrationsListController.$inject = ['ArbitrationsService'];

  function ArbitrationsListController(ArbitrationsService) {
    var vm = this;

    vm.arbitrations = ArbitrationsService.query();
  }
}());
