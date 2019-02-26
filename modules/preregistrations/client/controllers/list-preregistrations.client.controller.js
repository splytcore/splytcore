(function () {
  'use strict';

  angular
    .module('preregistrations')
    .controller('PreregistrationsListController', PreregistrationsListController);

  PreregistrationsListController.$inject = ['PreregistrationsService', '$http', '$window'];

  function PreregistrationsListController(PreregistrationsService, $http, $window) {
    
    var vm = this
	vm.addRemoveSendList = addRemoveSendList
	vm.selectAll = selectAll
	vm.unselectAll = unselectAll
	vm.sendInvites = sendInvites

    vm.preregistrations = PreregistrationsService.query();
    vm.toSendList = []

    console.log(vm.toSendList)


    function addRemoveSendList(preId) {

    	let index = vm.toSendList.indexOf(preId)
    	// console.log('index: ' + index )
    	if (index > -1) {
    		// console.log('remove')
    		vm.toSendList.splice(index, 1) 
    	} else {
    		// console.log('add')
	    	vm.toSendList.push(preId)
    	}
    }

    function selectAll() {

		let elements = document.getElementsByName("checkboxs[]");

		console.log(vm.preregistrations.length)

		elements.forEach((ele) => {
			// console.log(ele)
			ele.checked = true
		})

		vm.preregistrations.forEach((pre) => {
			if (vm.toSendList.indexOf(pre._id) == -1) {
				addRemoveSendList(pre._id)		
			}
		})
	}

    function unselectAll() {
  		
  		let elements = document.getElementsByName("checkboxs[]");

		elements.forEach((ele) => {
			// console.log(ele)
			ele.checked = false
		})

		vm.preregistrations.forEach((pre) => {
			if (vm.toSendList.indexOf(pre._id) > -1) {
				addRemoveSendList(pre._id)
			}
		})
	}

    function sendInvites() {
     	if ($window.confirm('confirm to send emails?')) {
    		console.log(vm.toSendList)
    		vm.toSendList.forEach((preId) => {
    			$http.put('/api/preregistrations/' + preId + '/sendInvite')
    				.then((result) => {
    					console.log('email sent: ')
    				})
    				.catch((err) => {
    					console.log(err)
    				})
    		})
		}
	}
  }

}());
