(function () {
  'use strict'

  // Affiliates controller
  angular
    .module('affiliates')
    .controller('AffiliatesCategoryController', AffiliatesCategoryController)

  AffiliatesCategoryController.$inject = ['$scope', '$state', '$window', 'Authentication', 'CategoriesService', 'Users', 'StoresService', 'AssetsService']

  function AffiliatesCategoryController ($scope, $state, $window, Authentication, CategoriesService, Users, StoresService, AssetsService) {
    var vm = this

    vm.authentication = Authentication
    vm.user = vm.authentication.user
    
    // console.log(vm.user.categories)

    vm.updateMyStoreCategories = updateMyStoreCategories
    vm.selectCategory = selectCategory

    vm.categories = CategoriesService.query()
    vm.assets = AssetsService.query()

    StoresService.query({ affiliate: vm.user._id }).$promise.then(function(data){
      vm.store = data[0]
      console.log(vm.store)
    })

  
    // update affiliate category setting
    function selectCategory(categoryId) {
      console.log(categoryId)
      
      let indexOf = vm.store.categories.indexOf(categoryId)
      if (indexOf > 0) {
        console.log('removing')
        vm.store.categories.splice(indexOf, 1)
      } else {          
        console.log('adding')
        vm.store.categories.push(categoryId)
      }    
   
    }

    // update affiliate category setting
    function updateMyStoreCategories() {
      console.log('updaging my category')  
      console.log(vm.store.categories)

      vm.store.$update((response) => {
        vm.success = true;
      }, (error) => {
        vm.error = error.data.message
      })

    }

  }
}());
