(function () {
  'use strict';

  // Hashtags controller
  angular
    .module('hashtags')
    .controller('HashtagsController', HashtagsController);

  HashtagsController.$inject = ['AssetsService', '$stateParams','$scope', '$state', '$window', 'Authentication', 'hashtagResolve'];

  function HashtagsController (AssetsService, $stateParams, $scope, $state, $window, Authentication, hashtag) {
    var vm = this;

    vm.authentication = Authentication;
    vm.hashtag = hashtag;
    vm.error = null;
    vm.form = {};
    vm.remove = remove;
    vm.save = save;
    console.log($stateParams)

    if (!vm.hashtag._id) {
      vm.hashtag.asset = AssetsService.get({ assetId: $stateParams.assetId })
      console.log(vm.hashtag)
    } else {

    }


    // Remove existing Hashtag
    function remove() {
      if ($window.confirm('Are you sure you want to delete?')) {
        vm.hashtag.$remove($state.go('hashtags.list'));
      }
    }

    // Save Hashtag
    function save(isValid) {

      if (!isValid) {
        $scope.$broadcast('show-errors-check-validity', 'vm.form.hashtagForm');
        return false;
      }

      // TODO: move create/update logic to service
      if (vm.hashtag._id) {
        vm.hashtag.$update(successCallback, errorCallback);
      } else {
        vm.hashtag.$save(successCallback, errorCallback);
      }

      function successCallback(res) {
        $state.go('hashtags.view', {
          hashtagId: res._id
        });
      }

      function errorCallback(res) {
        vm.error = res.data.message;
      }
    }
  }
}());
