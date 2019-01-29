(function () {
  'use strict'

  // Affiliates controller
  angular
    .module('affiliates')
    .controller('AffiliatesAssetsController', AffiliatesAssetsController)

  AffiliatesAssetsController.$inject = ['$http', '$filter', '$stateParams', '$scope', '$state', '$window', 'Authentication', 'CategoriesService', 'Users', 'StoresService', 'AssetsService', 'StoreAssetsService']

  function AffiliatesAssetsController ($http, $filter, $stateParams, $scope, $state, $window, Authentication, CategoriesService, Users, StoresService, AssetsService, StoreAssetsService) {
    var vm = this

    vm.authentication = Authentication
    vm.user = vm.authentication.user
    
    vm.updateMyStoreCategories = updateMyStoreCategories  

    vm.selectCategory = selectCategory
    vm.selectAsset = selectAsset

    vm.categories = CategoriesService.query()
    vm.assets = AssetsService.query()

    StoresService.get({ storeId: $stateParams.storeId }).$promise.then(function(data){
      // console.log(data)
      vm.store = data
      vm.storeAssetIds = vm.store.storeAssets.map(s => s.asset._id)
     
    })

    //Select assets to show/hide for affiliate store
    function selectAsset(assetId) {
      console.log(assetId)
      
      let indexOf = vm.storeAssetIds ? vm.storeAssetIds.indexOf(assetId) : -1
    
      console.log(indexOf)
  
      if (indexOf > -1) {
        console.log('removing')

        vm.store.storeAssets.forEach(storeAsset => {
          // console.log(storeAsset)
          if (assetId.indexOf(storeAsset.asset._id) > -1) {
              vm.storeAsset = new StoreAssetsService()
              vm.storeAsset._id = storeAsset._id
              vm.storeAsset.$remove((response) => {
                // console.log(response)
                vm.success = 'Asset has been removed from your store'
                vm.storeAssetIds.splice(indexOf, 1) 
              }, (error) => {
                vm.error = error.data.message
              })
          }
        })     

      } else {          
        console.log('adding')
        vm.storeAsset = new StoreAssetsService()
        vm.storeAsset.store = vm.store._id
        vm.storeAsset.asset = assetId
        console.log(vm.storeAsset)
        vm.storeAsset.$save((response) => {
          console.log(response)
          vm.success = 'Asset has been added to your store'
          vm.storeAssetIds.push(response._id)
          vm.store.storeAssets.push(response)
        }, (error) => {
          vm.error = error.data.message
        })
      }    
   
    }

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

    // update affiliate category setting
    function updateMyStoreAssets() {
      console.log('updaging my assets')  
      console.log(vm.storeAssetIds)

      vm.storeAssets.$update((response) => {
        vm.success = true;
      }, (error) => {
        vm.error = error.data.message
      })


    }

  }
}());
