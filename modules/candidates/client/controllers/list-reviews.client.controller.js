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

    vm.buildPager = function () {
      vm.pagedItems = []
      vm.itemsPerPage = 10
      vm.currentPage = 1
      vm.figureOutItemsToDisplay()
    }

    vm.figureOutItemsToDisplay = function () {
      let begin = ((vm.currentPage - 1) * vm.itemsPerPage)
      let end = begin + vm.itemsPerPage
      vm.pagedItems = vm.reviews.slice(begin, end)
    }

    vm.pageChanged = function () {      
      vm.figureOutItemsToDisplay()
    }


    ReviewsService.list()
      .success((res) => {        
        vm.reviews = res         
        vm.buildPager() 
      })
      .error((res) => {
        console.log('failure')
        console.log(res)
      })  

  }
}());
