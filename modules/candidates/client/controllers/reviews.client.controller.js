(function () {
  'use strict';

  // Candidates controller
  angular
    .module('candidates')
    .controller('ReviewsController', ReviewsController);

  ReviewsController.$inject = ['$scope', '$state', '$window', 'Authentication', 'ReviewsService'];

  function ReviewsController ($scope, $state, $window, Authentication, ReviewsService) {
    
    var vm = this;
    vm.authentication = Authentication;

    vm.error = null
    vm.form = {}
    vm.remove = remove
    vm.update = update           
    vm.create = create

    ReviewsService.get($state.params.candidateId)
      .success((res) => {        
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
          vm.success = res.message                             
        })
        .error((res) => {
          console.log('failure')
          vm.error = res.message
        })  

    }

    function update() {

      ReviewsService.update(vm.review)
        .success((res) => {
          vm.success = res.message
        })
        .error((res) => {
          console.log('failure')
          vm.error = res.message
        })  

    }


  }
}());
