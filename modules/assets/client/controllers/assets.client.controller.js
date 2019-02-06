(function () {
  'use strict';

  // Assets controller
  angular
    .module('assets')
    .controller('AssetsController', AssetsController);

  AssetsController.$inject = ['CartsService', 'CartsItemsService', '$scope', '$state', '$window', 'Authentication', 'assetResolve', '$q', '$cookies', '$filter', 'CategoriesService', 'FileUploader', '$timeout'];

  function AssetsController (CartsService, CartsItemsService,  $scope, $state, $window, Authentication, asset, $q, $cookies, $filter, CategoriesService, FileUploader, $timeout) {
    var vm = this
    vm.save = save   
    vm.asset = asset
    console.log(vm.asset)
    vm.categories = CategoriesService.query()

    vm.remove = remove
    vm.user = Authentication.user
    vm.addToCart = addToCart


    function addToCart(assetId) {

      let cartItem = new CartsItemsService()
      cartItem.cart = $cookies.cartId
      cartItem.asset = assetId
      cartItem.quantity = vm.qty

      cartItem.$save((result) => {
        console.log('success')
        console.log(result)
        alert('added to cart!')
      }, (error) => {
        console.log('error')
        vm.error = error
      })

    }

    function save(isValid) {
      if (!isValid) {
        $scope.$broadcast('show-errors-check-validity', 'vm.form.assetForm');
        return false;
      }

      if (vm.asset._id) {
        vm.asset.$update(successCallback, errorCallback);
      } else {
        vm.asset.$save(successCallback, errorCallback);
      }

      function successCallback(asset) {  
        alert('updated!')
      }

      function errorCallback(res) {
        vm.error = res.data.message;
      }
    }

    function remove() {
      if ($window.confirm('Are you sure you want to delete?')) {
        vm.asset.$remove($state.go('assets.list'));
      }
    }

    $scope.uploader = new FileUploader({
      url: 'api/assets/picture/upload',
      alias: 'newAssetImage'
    });

    $scope.uploader.onAfterAddingFile = function (fileItem) {
      if ($window.FileReader) {
        var fileReader = new FileReader();
        fileReader.readAsDataURL(fileItem._file);

        fileReader.onload = function (fileReaderEvent) {
          console.log(fileReaderEvent.target.result)
          $timeout(function () {
            var imageTarget = document.getElementById('imageTarget')
            imageTarget.src = fileReaderEvent.target.result
            $scope.uploader.uploadAll();
          }, 0)
        }
      }
    }

    $scope.uploader.onSuccessItem = function (fileItem, response, status, headers) {
      if(status === 200) {
        vm.asset.imageURL = [response.imageURL]
      }
    }
  }
}());
