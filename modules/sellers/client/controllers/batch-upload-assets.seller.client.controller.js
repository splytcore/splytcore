(function () {
    'use strict';
  
    // Sellers Dashboard controller
    angular
      .module('sellers')
      .controller('SellerBatchUploadAssetsController', SellerBatchUploadAssetsController);
  
    SellerBatchUploadAssetsController.$inject = ['$scope', '$state', '$window', 'Authentication', 'AssetsService', 'CategoriesService', 'FileUploader'];
  
    function SellerBatchUploadAssetsController ($scope, $state, $window, Authentication, AssetsService, CategoriesService, FileUploader) {
      var vm = this;
      let progressBarDenomination
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

  
      // Called after the user selected a new csv file
      $scope.uploader.onAfterAddingFile = function (fileItem) {
        if ($window.FileReader) {
          var fileReader = new FileReader();
          fileReader.readAsText(fileItem._file);
  
          fileReader.onload = function (fileReaderEvent) {
            let csvParsed = Papa.parse(fileReaderEvent.target.result, {})
            if(!csvParsed.errors[0]) {
              csvParsed.data.splice(csvParsed.data.length - 1, 1)
              removeExtraFields(csvParsed.data)

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

      // Convert parsed CSV file from array to object format for display and saving purposes
      let removeExtraFields = dataArray => {

        // Extract keys splyt backend cares about, forget the others
        let keepColumns = []
        keepColumns.push(dataArray[0].indexOf('Title'))
        keepColumns.push(dataArray[0].indexOf('Body (HTML)'))
        keepColumns.push(dataArray[0].indexOf('Variant SKU'))
        keepColumns.push(dataArray[0].indexOf('Variant Inventory Qty'))
        keepColumns.push(dataArray[0].indexOf('Variant Price'))
        keepColumns.push(dataArray[0].indexOf('Image Src'))

        $scope.progressBarDenomination = 100 / dataArray.length -1
        
        let newData = []
        
        // Convert array csv to object arrays
        for(var x = 1; x < dataArray.length; x++) {
          // Append more fields here as asset DB model changes to reflect
          let asset = {
            title : dataArray[x][keepColumns[0]] === '' ? dataArray[x][0] : dataArray[x][keepColumns[0]],
            description: dataArray[x][keepColumns[1]] === '' ? "Description" : dataArray[x][keepColumns[1]],
            sku : dataArray[x][keepColumns[2]] === '' ? "SKU" : dataArray[x][keepColumns[2]],
            inventoryCount : dataArray[x][keepColumns[3]],
            price: parseFloat(dataArray[x][keepColumns[4]]),
            imageURL: dataArray[x][keepColumns[5]],
            hashtag: dataArray[x][keepColumns[0]] === '' ? dataArray[x][0] : dataArray[x][keepColumns[0]]
          }
          newData.push(asset)
          if(x + 1 ===  dataArray.length) {
            $scope.uploadedData = newData  
            $scope.$apply()
          }
        }  
      }
    }
  }());
  