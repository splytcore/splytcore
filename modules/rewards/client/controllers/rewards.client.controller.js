(function () {
  'use strict';

  // Rewards controller
  angular
    .module('rewards')
    .controller('RewardsController', RewardsController);

  RewardsController.$inject = ['$scope', '$state', '$window', 'Authentication', 'rewardResolve', 'CategoriesService', '$q'];

  function RewardsController ($scope, $state, $window, Authentication, reward, CategoriesService, $q) {
    var vm = this;
     
    vm.publicKey = '0xD1A421A5F199cd16Ca49778841CB88053768d5f1'
    vm.privateKey = 'c165c12ca90658dfc7906c11dde6a7e5f9c67d49476649d9a26bb2e65578b352'  
    
    vm.web3 = new Web3($window.web3.currentProvider);
    
    console.log('is connected: ' + vm.web3.isConnected())
    // console.log('blockNumber: ' + vm.web3.eth.blockNumber)

    // Get the contract instance using your contract's abi and address:    
    vm.rewardABI = vm.web3.eth.contract([{"constant":false,"inputs":[],"name":"verifyFalse","outputs":[{"name":"","type":"bool"}],"payable":false,"stateMutability":"nonpayable","type":"function"},{"constant":true,"inputs":[],"name":"promisee","outputs":[{"name":"","type":"address"}],"payable":false,"stateMutability":"view","type":"function"},{"constant":true,"inputs":[],"name":"id","outputs":[{"name":"","type":"string"}],"payable":false,"stateMutability":"view","type":"function"},{"constant":true,"inputs":[],"name":"stage","outputs":[{"name":"","type":"uint8"}],"payable":false,"stateMutability":"view","type":"function"},{"constant":true,"inputs":[],"name":"promisor","outputs":[{"name":"","type":"address"}],"payable":false,"stateMutability":"view","type":"function"},{"constant":false,"inputs":[],"name":"setFulfilled","outputs":[{"name":"","type":"bool"}],"payable":false,"stateMutability":"nonpayable","type":"function"},{"constant":false,"inputs":[{"name":"_stage","type":"uint8"}],"name":"setStage","outputs":[{"name":"","type":"bool"}],"payable":false,"stateMutability":"nonpayable","type":"function"},{"constant":true,"inputs":[],"name":"getAmount","outputs":[{"name":"","type":"uint256"}],"payable":false,"stateMutability":"view","type":"function"},{"constant":false,"inputs":[],"name":"releaseReward","outputs":[{"name":"","type":"bool"}],"payable":false,"stateMutability":"nonpayable","type":"function"},{"constant":false,"inputs":[],"name":"verify","outputs":[{"name":"","type":"bool"}],"payable":false,"stateMutability":"nonpayable","type":"function"},{"inputs":[{"name":"_id","type":"string"},{"name":"_promisor","type":"address"}],"payable":true,"stateMutability":"payable","type":"constructor"},{"payable":true,"stateMutability":"payable","type":"fallback"}]);

    vm.rewardManagerABI = vm.web3.eth.contract([{"constant":true,"inputs":[{"name":"_id","type":"string"}],"name":"getRewardById","outputs":[{"name":"","type":"address"}],"payable":false,"stateMutability":"view","type":"function"},{"constant":true,"inputs":[{"name":"_index","type":"uint256"}],"name":"getRewardByIndex","outputs":[{"name":"","type":"address"}],"payable":false,"stateMutability":"view","type":"function"},{"constant":false,"inputs":[{"name":"_id","type":"string"}],"name":"createReward","outputs":[{"name":"","type":"bool"}],"payable":false,"stateMutability":"nonpayable","type":"function"},{"constant":true,"inputs":[],"name":"getRewardsLength","outputs":[{"name":"","type":"uint256"}],"payable":false,"stateMutability":"view","type":"function"}]);

    vm.rewardManagerAddress = '0x422b09aad8100348Fd25E05Dd16122aD91e8b884'

    vm.rewardManagerContract = vm.rewardManagerABI.at(vm.rewardManagerAddress)

    // Call a function of the contract:
    // vm.rewardContract.stage((err, res) => {
    //   console.log('gettint stage: ' + res)
    // })

    vm.gas = {
      // from: vm.publicKey,
      gasPrice: vm.web3.toHex(3000000),   //maximum price per gas
      gas: vm.web3.toHex(4600000) //max number of gas to be used  
    }

    vm.authentication = Authentication;
    vm.reward = reward;
    vm.error = null;
    vm.form = {};
    vm.remove = remove;
    vm.save = save;
    vm.setFulfilled = setFulfilled;
    vm.verify = verify;
    vm.verifyFalse = verifyFalse;
    vm.releaseReward = releaseReward;


    console.log('rewardId: ' + vm.reward._id)
    console.log('rewardIdHex: ' + vm.web3.toHex(vm.reward._id))
    
    if (vm.reward._id) {
      vm.rewardContract = vm.rewardABI.at(vm.reward.address)
    }

    // vm.categories = CategoriesService.query()
    CategoriesService.query().$promise
    .then((result) => {
        console.log(result)
        vm.categories = result
    })

    // Remove existing Reward
    function remove() {
      if ($window.confirm('Are you sure you want to delete?')) {
        vm.reward.$remove($state.go('rewards.list'));
      }
    }

    // Set fullfilled by promisee
    function setFulfilled() {
      console.log('fulfilled!')                      

      //example of how to use $q to chain promises
      // $q((resolve, reject) => {        
      //   var deferred = $q.defer();
      //   setTimeout(function() {          
      //     resolve('step 1')
      //   }, 1000)
      // })
      // .then((step) => {
      //   console.log(step)
      //   let deferred = $q.defer()
      //   setTimeout(function() {                    
      //     deferred.resolve('step 2')
      //   }, 1000)        
      //   return deferred.promise
      // })
      // .then((step) => {
      //   console.log(step)
      //   let deferred = $q.defer()
      //   setTimeout(function() {                    
      //     deferred.reject('step 3')
      //   }, 1000)        
      //   return deferred.promise
      // })
      // .then((step) => {
      //   console.log(step)
      //   let deferred = $q.defer()
      //   setTimeout(function() {                    
      //     deferred.resolve('final')
      //   }, 1000)        
      //   return deferred.promise
      // })
      // .then((step) => {
      //   console.log(step)
      // })
      // .catch((err) => {
      //   console.log('error')
      //   console.log(err)
      // })

      vm.rewardContract.setFulfilled.sendTransaction(vm.gas, (err, trxid) => {
        console.log('trxid: ' + trxid)
      })

    }

    function verify() {
      //need to use promisor wallet
      vm.rewardContract.verify.sendTransaction(vm.gas, (err, trxid) => {
        console.log('trxid: ' + trxid)
      })

    }

    function verifyFalse() {
      //need to use promisor wallet
      vm.rewardContract.verifyFalse.sendTransaction(vm.gas, (err, trxid) => {
        console.log('trxid: ' + trxid)
      })
    }

    function releaseReward() {
      //anyone can call this function to pay promisee
      vm.rewardContract.releaseReward.sendTransaction(vm.gas, (err, trxid) => {
        console.log('trxid: ' + trxid)
      })
    }


    // Save Reward
    function save(isValid) {
      if (!isValid) {
        $scope.$broadcast('show-errors-check-validity', 'vm.form.rewardForm');
        return false;
      }

      // TODO: move create/update logic to service
      if (vm.reward._id) {
        vm.reward.$update(successCallback, errorCallback);
      } else {
        vm.reward.$save(successCallback, errorCallback);
      }

      function successCallback(res) {
        console.log('reward Id: ')
        console.log(res._id)
        console.log('toHex: ' + vm.web3.toHex(res._id))
        let rewardId = vm.web3.toHex(res._id)
        $q((resolve, reject) => {                  
          vm.rewardManagerContract.createReward.sendTransaction(rewardId, vm.gas, (err, trxid) => {
            console.log('trxid: ' + trxid)
            if (err) {
              reject(err)
            } else {
              resolve(trxid)
            }
          })          
        })
        .then((trxid) => {
          // $state.go('rewards.view', {
          //   rewardId: res._id
          // });          
        })
      }

      function errorCallback(res) {
        vm.error = res.data.message;
      }
    }
  }
}());
