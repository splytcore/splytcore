(function () {
  'use strict';

  angular
    .module('stripes')
    .controller('StripesListController', StripesListController);

  StripesListController.$inject = ['StripesService'];

  function StripesListController(StripesService) {
    var vm = this;

    vm.stripes = StripesService.query();
  }
}());
