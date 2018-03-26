(function () {
  'use strict';

  // Candidates controller
  angular
    .module('candidates')
    .controller('UploadResumeController', UploadResumeController);

  UploadResumeController.$inject = ['$scope', '$state', '$window', 'Authentication', 'CandidatesService', 'FileUploader', '$timeout'];

  function UploadResumeController ($scope, $state, $window, Authentication, CandidatesService, FileUploader, $timeout) {
    
    var vm = this;
    vm.authentication = Authentication;

    vm.error = null
    vm.form = {}    
    vm.uploadImageResume = uploadImageResume
    vm.cancelImageUpload = cancelImageUpload    

    vm.uploadDocResume = uploadDocResume
    vm.cancelDocUpload = cancelDocUpload        
    vm.email = $state.params.email
    vm.registeredFrom = $state.params.registeredFrom

    vm.finish = finish;    

    function finish() {
      $state.go('candidates.registrationSuccess', { registeredFrom: $state.params.registeredFrom })
    }

    console.log($state.params)  
    // Create file uploader instance    
    vm.imageUploader = new FileUploader({
      url: 'api/uploadImageResume/',
      alias: 'newResumePicture'
    });

    // Create file uploader instance    
    vm.docUploader = new FileUploader({
      url: 'api/uploadDocResume/',
      alias: 'newResumeDoc'
    });


    // Set file uploader image filter
    vm.imageUploader.filters.push({
      name: 'imageFilter',
      fn: function (item, options) {
        var type = '|' + item.type.slice(item.type.lastIndexOf('/') + 1) + '|';
        return '|jpg|png|jpeg|bmp|gif|'.indexOf(type) !== -1;
      }
    })

    // // Set file uploader filter
    // vm.docUploader.filters.push({
    //   name: 'docFilter',
    //   fn: function (item, options) {
    //     console.log('item : ')
    //     console.log(item)
    //     console.log('options : ')
    //     console.log(options)
    //     var type = '|' + item.type.slice(item.type.lastIndexOf('/') + 1) + '|';
    //     return '|txt|'.indexOf(type) !== -1;
    //   }
    // })


    vm.imageUploader.onBeforeUploadItem = function(item) {
      item.url += vm.email
    }

    vm.docUploader.onBeforeUploadItem = function(item) {
      item.url += vm.email
    }


    // Called after the user selected a new picture file
    vm.imageUploader.onAfterAddingFile = function (fileItem) {
      if ($window.FileReader) {
        var fileReader = new FileReader();
        fileReader.readAsDataURL(fileItem._file);

        fileReader.onload = function (fileReaderEvent) {
          $timeout(function () {
            vm.resumeImageURL = fileReaderEvent.target.result;            
          }, 0);
        };
      }
    };


    // Called after the user selected a file
    vm.docUploader.onAfterAddingFile = function (fileItem) {
      console.log(fileItem.file.name)
      if ($window.FileReader) {
        var fileReader = new FileReader();
        fileReader.readAsDataURL(fileItem._file);        
        fileReader.onload = function (fileReaderEvent) {
          $timeout(function () {          
            vm.resumeDocURL = fileReaderEvent.target.result;            
            console.log(vm.resumeDocURL)
          }, 0);
        };
      }
    };


    // Called after the user has successfully uploaded a new picture
    vm.imageUploader.onSuccessItem = function (fileItem, response, status, headers) {
      // Show success message
      vm.success = true;
      vm.filename = fileItem.file.name
      // Clear upload buttons
      vm.cancelImageUpload();
      console.log(response)
    }

    // Called after the user has successfully uploaded a new picture
    vm.docUploader.onSuccessItem = function (fileItem, response, status, headers) {
      // Show success message
      vm.success = true;

      // Clear upload buttons
      vm.cancelDocUpload();
      console.log(response)
    }

    // Called after the user has failed to uploaded a new picture
    vm.imageUploader.onErrorItem = function (fileItem, response, status, headers) {
      // Clear upload buttons
      vm.cancelImageUpload();

      // Show error message
      vm.error = response.message;
    }

    vm.docUploader.onErrorItem = function (fileItem, response, status, headers) {
      // Clear upload buttons
      vm.cancelDocUpload();

      // Show error message
      vm.error = response.message;
    }


    // Change user profile picture
    function uploadImageResume () {      
      // Clear messages
      vm.success = vm.error = null;
      // Start upload            
      vm.imageUploader.uploadAll();
    }

    function uploadDocResume () {      
      // Clear messages
      vm.success = vm.error = null;
      // Start upload            
      vm.docUploader.uploadAll();
    }


    // Cancel the upload process
    function cancelImageUpload() {
      vm.imageUploader.clearQueue();      
      vm.resumeImageURL = null
    }

    function cancelDocUpload() {
      vm.docUploader.clearQueue();      
      vm.resumeDocURL = null
    }

  }
}());
