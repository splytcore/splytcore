(function () {
  'use strict';

  // Affiliates controller
  angular
    .module('affiliates')
    .controller('AffiliatesCategoryController', AffiliatesCategoryController);

  AffiliatesCategoryController.$inject = ['$scope', '$state', '$window', 'Authentication', 'CategoriesService', 'Users'];

  function AffiliatesCategoryController ($scope, $state, $window, Authentication, CategoriesService, Users) {
    var vm = this;

    vm.authentication = Authentication;
    vm.user = vm.authentication.user;
    vm.updateMyCategory = updateMyCategory

    vm.categories = CategoriesService.query()
    console.log(vm.categories)

    // update affiliate category setting
    function updateMyCategory() {
      console.log('updaging my category')
  
      var user = new Users(vm.user);

      user.$update(function (response) {
        $scope.$broadcast('show-errors-reset', 'userForm');

        $scope.success = true;
        Authentication.user = response;
        console.log('successful update')      
  
      }, function (response) {
        $scope.error = response.data.message;
      });


    }


  }
}());
