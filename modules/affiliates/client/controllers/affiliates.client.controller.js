(function () {
  'use strict';

  // Affiliates controller
  angular
    .module('affiliates')
    .controller('AffiliatesController', AffiliatesController);

  AffiliatesController.$inject = ['$scope', '$state', '$window', 'Authentication', 'affiliateResolve'];

  function AffiliatesController ($scope, $state, $window, Authentication, affiliate) {
    var vm = this;

    vm.authentication = Authentication;
    vm.affiliate = affiliate;
    vm.error = null;
    vm.form = {};
    vm.remove = remove;
    vm.save = save;

    // Remove existing Affiliate
    function remove() {
      if ($window.confirm('Are you sure you want to delete?')) {
        vm.affiliate.$remove($state.go('affiliates.list'));
      }
    }

    // Save Affiliate
    function save(isValid) {
      if (!isValid) {
        $scope.$broadcast('show-errors-check-validity', 'vm.form.affiliateForm');
        return false;
      }

      // TODO: move create/update logic to service
      if (vm.affiliate._id) {
        vm.affiliate.$update(successCallback, errorCallback);
      } else {
        vm.affiliate.$save(successCallback, errorCallback);
      }

      function successCallback(res) {
        $state.go('affiliates.view', {
          affiliateId: res._id
        });
      }

      function errorCallback(res) {
        vm.error = res.data.message;
      }
    }
  }
}());
