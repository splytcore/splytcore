(function () {
  'use strict'

  angular
    .module('preregistrations')
    .controller('PreregistrationsListController', PreregistrationsListController)

  PreregistrationsListController.$inject = ['PreregistrationsService', '$http', '$window', '$state']

  function PreregistrationsListController(PreregistrationsService, $http, $window, $state) {
            
    var vm = this
	  vm.addRemoveList = addRemoveList
	  
    vm.selectAll = selectAll
	  vm.unselectAll = unselectAll
	  vm.deleteList = deleteList

    vm.preregistrations = PreregistrationsService.query()
    vm.toDeleteList = []

    console.log(vm.toDeleteList)


    function addRemoveList(preId) {

    	let index = vm.toDeleteList.indexOf(preId)
    	// console.log('index: ' + index )
    	if (index > -1) {
    		// console.log('remove')
    		vm.toDeleteList.splice(index, 1) 
    	} else {
    		// console.log('add')
	    	vm.toDeleteList.push(preId)
    	}
    }

    function selectAll() {

  		let elements = document.getElementsByName('checkboxs[]');

  		console.log(vm.preregistrations.length)

  		elements.forEach((ele) => {
  			// console.log(ele)
  			ele.checked = true
  		})

  		vm.preregistrations.forEach((pre) => {
  			if (vm.toDeleteList.indexOf(pre._id) === -1) {
  				addRemoveList(pre._id)		
  			}
  		})
	  }

    function unselectAll() {
        		
  		let elements = document.getElementsByName('checkboxs[]')

		  elements.forEach((ele) => {
			// console.log(ele)
        ele.checked = false
		  })

  		vm.preregistrations.forEach((pre) => {
  			if (vm.toDeleteList.indexOf(pre._id) > -1) {
  				addRemoveList(pre._id)
  			}
  		})
    }

    function deleteList() {
     	if ($window.confirm('confirm to send emails?')) {
    		console.log(vm.toDeleteList)
    		vm.toDeleteList.forEach((preId) => {
    			$http.delete('/api/preregistrations/' + preId)
    				.then((result) => {
    					console.log('deleted')
    				})
    				.catch((err) => {
    					console.log(err)
    				})
    		})

		    $state.go('preregistrations.list', {}, { reload: true })
      }
	  }
  }

}())
