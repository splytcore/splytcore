(function () {
    'use strict';
  
    // Sellers Dashboard controller
    angular
      .module('sellers')
      .controller('SellerBatchUploadAssetsController', SellerBatchUploadAssetsController);
  
    SellerBatchUploadAssetsController.$inject = ['$scope', '$state', '$window', 'Authentication', 'AssetsService', 'CategoriesService', 'FileUploader', '$timeout'];
  
    function SellerBatchUploadAssetsController ($scope, $state, $window, Authentication, AssetsService, CategoriesService, FileUploader, $timeout) {
      var vm = this;
      let progressBarDenomination
      /* jshint ignore:start */

      $scope.countTo, $scope.progressValue = 0

      $scope.uploader = new FileUploader({
        url: 'api/users/picture',
        alias: 'newCsvFile'
      });
  
      // Set file uploader image filter
      $scope.uploader.filters.push({
        name: 'csvFilter',
        fn: function (item, options) {
          var type = '|' + item.type.slice(item.type.lastIndexOf('/') + 1) + '|';
          return '|csv|'.indexOf(type) !== -1;
        }
      });
      /* jshint ignore:end */


      // Convert parsed CSV file from array to object format for display and saving purposes
      let morphRawData = dataArray => {

        // Extract keys pollenly backend cares about, forget the others
        let rawColnIndex = {
          title: dataArray[0].indexOf('Title'),
          description: dataArray[0].indexOf('Body (HTML)'),
          sku: dataArray[0].indexOf('Variant SKU'),
          inventoryCount: dataArray[0].indexOf('Variant Inventory Qty'),
          price: dataArray[0].indexOf('Variant Price'),
          imageUrl: dataArray[0].indexOf('Image Src'),
        }

        $scope.progressBarDenomination = 100 / dataArray.length -1
        
        $scope.uploadedData = []

        console.log(rawColnIndex)

        let dataArraylen = dataArray.length
        // Convert array csv to object array
        for(var x = 1; x < dataArraylen; x++) {
          // Append more fields here as asset DB model changes to reflect
          $scope.uploadedData.push({
            title : dataArray[x][rawColnIndex.title].length < 1 ? 'No title' : dataArray[x][rawColnIndex.title],
            description: dataArray[x][rawColnIndex.description] === '' ? 'No description' : dataArray[x][rawColnIndex.description],
            sku : dataArray[x][rawColnIndex.sku] === '' ? 'No sku' : dataArray[x][rawColnIndex.sku],
            inventoryCount : dataArray[x][rawColnIndex.inventoryCount],
            price: parseFloat(dataArray[x][rawColnIndex.price]),
            imageURL: dataArray[x][rawColnIndex.imageUrl],
            hashtag: '',
            reward: 0
          })
          if(x + 1 ===  dataArraylen) {
            $scope.$apply()
          }
        }  
      }

      // Called after the user selected a new csv file
      $scope.uploader.onAfterAddingFile = function (fileItem) {
        if ($window.FileReader) {
          var fileReader = new FileReader();
          fileReader.readAsText(fileItem._file);
  
          fileReader.onload = function (fileReaderEvent) {
            let csv
            /* jshint ignore:start */
            csv = Papa.parse(fileReaderEvent.target.result, {})
            /* jshint ignore:end */

            if(!csv.errors[0]) {
              csv.data.splice(csv.data.length - 1, 1)
              morphRawData(csv.data)

            }
          }
        }
      }

      // Send individual assets to backend
      $scope.upload = () => {

        for(let x = 0; x < $scope.uploadedData.length; x++) {
          let asset = new AssetsService($scope.uploadedData[x])
          asset.$save(successCallback, errorCallback)
        }
  
        function successCallback(asset) {  
          $scope.countTo += progressBarDenomination
          $scope.progressValue += progressBarDenomination
        }
  
        function errorCallback(res) {
          vm.error = res.data.message;
        }
      }

      $scope.editThis = (dataElem) => {
        console.log(dataElem)
        dataElem.title = '<input value="' + dataElem.title + '"></input>'
      }
      
    }
  }());
  