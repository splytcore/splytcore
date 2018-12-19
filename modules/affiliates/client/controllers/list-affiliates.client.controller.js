(function () {
  'use strict';

  angular
    .module('affiliates')
    .controller('AffiliatesListController', AffiliatesListController);

  AffiliatesListController.$inject = ['AffiliatesService'];

  function AffiliatesListController(AffiliatesService) {
    var vm = this;

    vm.affiliates = AffiliatesService.query();
  }
}());
