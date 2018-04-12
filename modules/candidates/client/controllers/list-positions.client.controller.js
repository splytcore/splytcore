(function () {
  'use strict';

  angular
    .module('candidates')
    .controller('PositionsListController', PositionsListController);

  PositionsListController.$inject = ['PositionsService', 'Socket', '$scope'];

  function PositionsListController(PositionsService, Socket, $scope) {
    var vm = this    


    PositionsService.list()
      .success((res) => {
        console.log(res)          
        vm.positions = res
      })
      .error((res) => {
        console.log('failure')
        console.log(res)
      })

  }
}());
