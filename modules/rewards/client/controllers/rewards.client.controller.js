(function () {
  'use strict';

  // Rewards controller
  angular
    .module('rewards')
    .controller('RewardsController', RewardsController);

  RewardsController.$inject = ['$scope', '$state', '$window', 'Authentication', 'rewardResolve', 'CategoriesService'];

  function RewardsController ($scope, $state, $window, Authentication, reward, CategoriesService) {
    var vm = this;

    vm.authentication = Authentication;
    vm.reward = reward;
    vm.error = null;
    vm.form = {};
    vm.remove = remove;
    vm.save = save;

    vm.categories = CategoriesService.query()


    // Remove existing Reward
    function remove() {
      if ($window.confirm('Are you sure you want to delete?')) {
        vm.reward.$remove($state.go('rewards.list'));
      }
    }

    // Save Reward
    function save(isValid) {
      if (!isValid) {
        $scope.$broadcast('show-errors-check-validity', 'vm.form.rewardForm');
        return false;
      }

      // TODO: move create/update logic to service
      if (vm.reward._id) {
        vm.reward.$update(successCallback, errorCallback);
      } else {
        vm.reward.$save(successCallback, errorCallback);
      }

      function successCallback(res) {
        $state.go('rewards.view', {
          rewardId: res._id
        });
      }

      function errorCallback(res) {
        vm.error = res.data.message;
      }
    }
  }
}());
