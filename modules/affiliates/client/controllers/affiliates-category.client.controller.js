(function () {
  'use strict'

  // Affiliates controller
  angular
    .module('affiliates')
    .controller('AffiliatesCategoryController', AffiliatesCategoryController)

  AffiliatesCategoryController.$inject = ['$scope', '$state', '$window', 'Authentication', 'CategoriesService', 'Users']

  function AffiliatesCategoryController ($scope, $state, $window, Authentication, CategoriesService, Users) {
    var vm = this

    vm.authentication = Authentication
    vm.user = vm.authentication.user
    
    console.log(vm.user.categories)

    vm.updateMyCategories = updateMyCategories
    vm.selectCategory = selectCategory

    vm.categories = CategoriesService.query()
    console.log(vm.categories)

    // update affiliate category setting
    function selectCategory(categoryId) {
      let indexOf = vm.user.categories.indexOf(categoryId)
      if (indexOf > -1) {
        vm.user.categories.splice(indexOf, 1)
      } else {
        vm.user.categories.push(categoryId)
      }
    }

    // update affiliate category setting
    function updateMyCategories() {
      vm.success = false

      console.log('updaging my category')  
      var user = new Users(vm.user)

      user.$update(function (response) {
        $scope.$broadcast('show-errors-reset', 'userForm')

        vm.success = true;
        vm.user = response
  
      }, function (response) {
        vm.error = response.data.message
      })

    }

  }
}());
