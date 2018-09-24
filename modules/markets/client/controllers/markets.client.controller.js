(function () {
  'use strict';

  // Markets controller
  angular
    .module('markets')
    .controller('MarketsController', MarketsController);

  MarketsController.$inject = ['$scope', '$state', '$window', 'Authentication', 'marketResolve'];

  function MarketsController ($scope, $state, $window, Authentication, market) {
    var vm = this;

    vm.authentication = Authentication;
    vm.market = market;
    vm.error = null;
    vm.form = {};
    vm.remove = remove;
    vm.save = save;

    // Remove existing Market
    function remove() {
      if ($window.confirm('Are you sure you want to delete?')) {
        vm.market.$remove($state.go('markets.list'));
      }
    }

    // Save Market
    function save(isValid) {
      if (!isValid) {
        $scope.$broadcast('show-errors-check-validity', 'vm.form.marketForm');
        return false;
      }

      // TODO: move create/update logic to service
      if (vm.market._id) {
        vm.market.$update(successCallback, errorCallback);
      } else {
        vm.market.$save(successCallback, errorCallback);
      }

      function successCallback(res) {
        $state.go('markets.view', {
          marketId: res._id
        });
      }

      function errorCallback(res) {
        vm.error = res.data.message;
      }
    }
  }
}());
