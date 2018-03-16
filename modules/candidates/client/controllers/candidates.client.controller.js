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
    vm.uploadResume = uploadResume
    vm.cancelUpload = cancelUpload
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
    }
    
    // Create file uploader instance
    vm.uploader = new FileUploader({
      url: 'api/candidates/uploadResume',
      alias: 'newResumePicture'
    });

    // Set file uploader image filter
    vm.uploader.filters.push({
      name: 'imageFilter',
      fn: function (item, options) {
        var type = '|' + item.type.slice(item.type.lastIndexOf('/') + 1) + '|';
        return '|jpg|png|jpeg|bmp|gif|'.indexOf(type) !== -1;
      }
    })

    // Called after the user selected a new picture file
    vm.uploader.onAfterAddingFile = function (fileItem) {
      if ($window.FileReader) {
        var fileReader = new FileReader();
        fileReader.readAsDataURL(fileItem._file);

        fileReader.onload = function (fileReaderEvent) {
          $timeout(function () {
            vm.resumeURL = fileReaderEvent.target.result;
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
    vm.uploader.onSuccessItem = function (fileItem, response, status, headers) {
      // Show success message
      vm.success = true;

      // Clear upload buttons
      vm.cancelUpload();
      console.log(response)
    }

    // Called after the user has failed to uploaded a new picture
    vm.uploader.onErrorItem = function (fileItem, response, status, headers) {
      // Clear upload buttons
      vm.cancelUpload();

      // Show error message
      vm.error = response.message;
    }

    // Change user profile picture
    function uploadResume () {
      // Clear messages
      vm.success = vm.error = null;
      // Start upload
      vm.uploader.uploadAll();
    }

    // Cancel the upload process
    function cancelUpload() {
      vm.uploader.clearQueue();      
      // vm.resumeURL = vm.candidate.resumeURL
    }

  }
}());
