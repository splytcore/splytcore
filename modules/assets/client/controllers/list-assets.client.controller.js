(function () {
  'use strict';

  angular
    .module('assets')
    .controller('AssetsListController', AssetsListController);

  AssetsListController.$inject = ['AssetsService', '$state', 'Authentication', '$cookies'];

  function AssetsListController(AssetsService, $state, Authentication, $cookies) {
    
    var vm = this;
    vm.assets = AssetsService.query({ sort: '-created'})
 
  }
}());
