(function () {
  'use strict';

  // Candidates controller
  angular
    .module('candidates')
    .controller('ReviewController', ReviewController);

  ReviewController.$inject = ['$scope', '$state', '$window', 'Authentication', 'ReviewsService'];

  function ReviewController ($scope, $state, $window, Authentication, ReviewsService) {
    
    var vm = this;
    vm.authentication = Authentication;

    vm.error = null
    vm.form = {}
    vm.remove = remove
    vm.update = update           
    vm.create = create

    ReviewsService.get($state.params.candidateId)
      .success((res) => {
        console.log(res)          
        vm.review = res          
      })
      .error((res) => {
        console.log('failure')
        console.log(res)
      })  

    // Remove existing Candidate
    function remove() {
      if ($window.confirm('Are you sure you want to delete?')) {        
        ReviewsService.remove(vm.candidate._id)
          .success((res) => {
            console.log(res) 
            vm.success = res.message                 
            $state.go('candidates.list')
          })
          .error((res) => {
            console.log('failure')
            vm.error = res.message
          })        
      }
    }

    // checkin
    function create() {
      
      ReviewsService.create($state.params.candidateId, vm.review)
        .success((res) => {
          console.log(res) 
          vm.success = res.message                             
        })
        .error((res) => {
          console.log('failure')
          vm.error = res.message
        })  

    }

    function update() {

      ReviewsService.update($state.params.candidateId, vm.review)
        .success((res) => {
          console.log(res)
          vm.success = res.message
        })
        .error((res) => {
          console.log('failure')
          vm.error = res.message
        })  

    }


  }
}());
