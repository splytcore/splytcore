(function () {
  'use strict';

  // Candidates controller
  angular
    .module('candidates')
    .controller('ReviewsListController', ReviewsListController);

  ReviewsListController.$inject = ['$scope', '$state', '$window', 'Authentication', 'ReviewsService'];

  function ReviewsListController ($scope, $state, $window, Authentication, ReviewsService) {
    
    var vm = this;
    vm.authentication = Authentication;

    vm.error = null
    vm.form = {}

    ReviewsService.list()
      .success((res) => {        
        vm.reviews = res          
      })
      .error((res) => {
        console.log('failure')
        console.log(res)
      })  

  }
}());
