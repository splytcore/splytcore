(function () {
  'use strict';

  // Candidates controller
  angular
    .module('candidates')
    .controller('CandidatesController', CandidatesController);

  CandidatesController.$inject = ['$scope', '$state', '$window', 'Authentication', 'CandidatesService', 'FileUploader', '$timeout'];

  function CandidatesController ($scope, $state, $window, Authentication, CandidatesService, FileUploader, $timeout) {
    
    var vm = this;
    vm.authentication = Authentication;

    vm.error = null
    vm.form = {}
    vm.remove = remove
    vm.update = update;
    vm.checkin = checkin      
    vm.register = register

    vm.uploadImageResume = uploadImageResume
    vm.cancelImageUpload = cancelImageUpload    

    vm.uploadPdfResume = uploadPdfResume
    vm.cancelPdfUpload = cancelPdfUpload    

    vm.note = ''

    if ($state.params.candidateId) {
      CandidatesService.get($state.params.candidateId)
        .success((res) => {
          console.log(res)          
          vm.candidate = res
        })
        .error((res) => {
          console.log('failure')
          console.log(res)
        })  
    } else {
      vm.candidate = {}
    }
    

    // Create file uploader instance    
    vm.imageUploader = new FileUploader({
      url: 'api/uploadImageResume?email=',
      alias: 'newResumePicture'
    });

    // Create file uploader instance    
    vm.pdfUploader = new FileUploader({
      url: 'api/uploadPdfResume?email=',
      alias: 'newResumePdf'
    });


    // Set file uploader image filter
    vm.imageUploader.filters.push({
      name: 'imageFilter',
      fn: function (item, options) {
        var type = '|' + item.type.slice(item.type.lastIndexOf('/') + 1) + '|';
        return '|jpg|png|jpeg|bmp|gif|'.indexOf(type) !== -1;
      }
    })

    // Set file uploader image filter
    vm.pdfUploader.filters.push({
      name: 'pdfFilter',
      fn: function (item, options) {
        var type = '|' + item.type.slice(item.type.lastIndexOf('/') + 1) + '|';
        return '|pdf|'.indexOf(type) !== -1;
      }
    })


    vm.imageUploader.onBeforeUploadItem = function(item) {
      item.url += vm.candidate.email
    }

    vm.pdfUploader.onBeforeUploadItem = function(item) {
      item.url += vm.candidate.email
    }


    // Called after the user selected a new picture file
    vm.imageUploader.onAfterAddingFile = function (fileItem) {
      if ($window.FileReader) {
        var fileReader = new FileReader();
        fileReader.readAsDataURL(fileItem._file);

        fileReader.onload = function (fileReaderEvent) {
          $timeout(function () {
            vm.resumeURL = fileReaderEvent.target.result;
            console.log(vm.resumeURL)
          }, 0);
        };
      }
    };


    // Called after the user selected a new picture file
    vm.pdfUploader.onAfterAddingFile = function (fileItem) {
      if ($window.FileReader) {
        var fileReader = new FileReader();
        fileReader.readAsDataURL(fileItem._file);

        fileReader.onload = function (fileReaderEvent) {
          $timeout(function () {
            console.log('pdf uploaded')
            vm.resumePdfURL = fileReaderEvent.target.result;
            console.log(vm.resumePdfURL)
          }, 0);
        };
      }
    };


    // Remove existing Candidate
    function remove() {
      if ($window.confirm('Are you sure you want to delete?')) {
        vm.candidate.$remove($state.go('candidates.list'));
      }
    }

    // register
    function register(isValid) {
      if (!isValid) {
        $scope.$broadcast('show-errors-check-validity', 'vm.form.candidateForm');
        return false;
      }

      CandidatesService.register(vm.candidate)
        .success((res) => {
          console.log(res)                    
          if (vm.candidate.registeredFrom.indexOf('WEB') > -1) {
            uploadPdfResume()
          } else {
            uploadImageResume()  
          }          
        })
        .error((res) => {
          console.log('failure')
          vm.error = res.message
        })  

    }

    // checkin
    function checkin() {
      
      CandidatesService.checkin(vm.candidate.email)
        .success((res) => {
          console.log(res)                              
        })
        .error((res) => {
          console.log('failure')
          vm.error = res.message
        })  

    }

    function update() {

      CandidatesService.update(vm.candidate, vm.note)
        .success((res) => {
          console.log(res)
          vm.candidate = res
        })
        .error((res) => {
          console.log('failure')
          vm.error = res.message
        })  

    }


    // Called after the user has successfully uploaded a new picture
    vm.imageUploader.onSuccessItem = function (fileItem, response, status, headers) {
      // Show success message
      vm.success = true;

      // Clear upload buttons
      vm.cancelPdfUpload();
      console.log(response)
    }

    // Called after the user has successfully uploaded a new picture
    vm.pdfUploader.onSuccessItem = function (fileItem, response, status, headers) {
      // Show success message
      vm.success = true;

      // Clear upload buttons
      vm.cancelPdfUpload();
      console.log(response)
    }

    // Called after the user has failed to uploaded a new picture
    vm.imageUploader.onErrorItem = function (fileItem, response, status, headers) {
      // Clear upload buttons
      vm.cancelImageUpload();

      // Show error message
      vm.error = response.message;
    }

    vm.pdfUploader.onErrorItem = function (fileItem, response, status, headers) {
      // Clear upload buttons
      vm.cancelPdfUpload();

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

    function uploadPdfResume () {      
      // Clear messages
      vm.success = vm.error = null;
      // Start upload            
      vm.pdfUploader.uploadAll();
    }


    // Cancel the upload process
    function cancelImageUpload() {
      vm.imageUploader.clearQueue();      
      // vm.resumeURL = vm.candidate.resumeURL
    }

    function cancelPdfUpload() {
      vm.pdfUploader.clearQueue();      
      // vm.resumeURL = vm.candidate.resumeURL
    }

  }
}());
