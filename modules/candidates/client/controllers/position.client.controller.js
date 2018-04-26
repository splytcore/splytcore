(function () {
  'use strict';

  // Candidates controller
  angular
    .module('candidates')
    .controller('PositionsController', PositionsController);

  PositionsController.$inject = ['$scope', '$state', '$window', 'Authentication', 'PositionsService', 'DepartmentsService']

  function PositionsController ($scope, $state, $window, Authentication, PositionsService, DepartmentsService) {
    
    var vm = this
    vm.authentication = Authentication

    vm.error = null
    vm.form = {}
    vm.remove = remove
    vm.update = update           
    vm.create = create

    if ($state.params.positionId) {
      PositionsService.get($state.params.positionId)
        .success((res) => {          
          vm.position = res          
        })
        .error((res) => {          
          console.log(res)
        })  
    } 

    DepartmentsService.list()
      .success((res) => {
        vm.departments = res          
      })
      .error((res) => {
        console.log(res)
      })  


    // Remove existing Candidate
    function remove() {
      if ($window.confirm('Are you sure you want to delete?')) {        
        PositionsService.remove(vm.position._id)
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
      console.log(vm.position)
      PositionsService.create(vm.position)
        .success((res) => {
          
          vm.success = res.message                             
        })
        .error((res) => {
          console.log('failure')
          vm.error = res.message
        })  

    }

    function update() {

      PositionsService.update(vm.position)
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
