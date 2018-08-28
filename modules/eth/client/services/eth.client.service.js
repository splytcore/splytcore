
(function () {
  'use strict';

  angular
    .module('eth')
    .service('EthService', EthService);

  EthService.$inject = ['$http', '$window', '$q'];

  function EthService($http, $window, $q) {
    let vm = this
  
    vm.createAsset = createAsset;
    vm.purchase = purchase;
    vm.getMyWallets = getMyWallets;
    vm.getAllABI = getAllABI;

    vm.getAssetsLength = getAssetsLength;

    
    vm.web3 = new Web3($window.web3.currentProvider);
    
    console.log('is connected: ' + vm.web3.isConnected())
    
    console.log('web3 accounts: ' + vm.web3.eth.accounts)
    
    // console.log('blockNumber: ' + vm.web3.eth.blockNumber)
    vm.splytManagerContract
    vm.orderManagerContract
    vm.assetManagerContract
    vm.arbitrationManagerContract

    getAllABI()
      .success((config) => {
          console.log(config);
          vm.splytManagerContract = vm.web3.eth.contract(config.splytManagerABI).at(config.splytManagerAddress)
          vm.splytManagerContract.getManagerTrackerAddress((err, result) => {
            console.log('ManagerTrackerAddress: ' + result)
          })

          vm.splytManagerContract.assetManager((err, address) => {
            console.log('assetManager ' + address)
            vm.assetManagerContract = vm.web3.eth.contract(config.assetManagerABI).at(address)      
          })

          vm.splytManagerContract.orderManager((err, address) => {
            console.log('orderManager ' + address)
            vm.orderManagerContract = vm.web3.eth.contract(config.orderManagerABI).at(address) 
          })

          vm.splytManagerContract.arbitrationManager((err, address) => {
            console.log('arbitrationManager ' + address)
            vm.arbitrationManagerContract = vm.web3.eth.contract(config.arbitrationManagerABI).at(address) 
          })



          vm.splytManagerContract.owner((err, result) => {
            console.log('splytManagerContract owner ' + result)
          })

          // vm.assetContract.setFulfilled.sendTransaction(vm.gas, (err, trxid) => {
          //   console.log('trxid: ' + trxid)
          // })

          // console.log(vm.splytManagerContract.methods.getManagerTrackerAddress().call())
      })
      .error((err) => {
        console.log(err)
      })

    // Call a function of the contract:
    // vm.assetContract.stage((err, res) => {
    //   console.log('gettint stage: ' + res)
    // })

    vm.gas = {
      // from: vm.publicKey,
      gasPrice: vm.web3.toHex(3000000),   //maximum price per gas
      gas: vm.web3.toHex(4600000) //max number of gas to be used  
    }

    function getAssetsLength() {
      // vm.assetManagerContract.getAssetsLength((err, length) => {
      //   console.log('number of listed assets ' + length)
      // })      
    }


    function getMyWallets() {
      return vm.web3.eth.accounts
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

      vm.assetContract.setFulfilled.sendTransaction(vm.gas, (err, trxid) => {
        console.log('trxid: ' + trxid)
      })

    }

    function getAllABI() {
      return $http.get('/api/abi/getAll');
    }


    function verify() {
      //need to use promisor wallet
      vm.assetContract.verify.sendTransaction(vm.gas, (err, trxid) => {
        console.log('trxid: ' + trxid)
      })

    }

    function verifyFalse() {
      //need to use promisor wallet
      vm.assetContract.verifyFalse.sendTransaction(vm.gas, (err, trxid) => {
        console.log('trxid: ' + trxid)
      })
    }

    function purchase(assetId) {
      let assetIdHex = vm.web3.toHex(assetId)
      //anyone can call this function to pay promisee
      // vm.assetManagerContract.createAsset.sendTransaction(assetIdHex, vm.gas, (err, trxid) => {      
      vm.assetManagerContract.purchase.sendTransaction(assetIdHex, vm.gas, (err, trxid) => {
        console.log('trxid: ' + trxid)
      })
    }

    function createAsset(asset) {
      console.log(asset)
      console.log('toHex: ' + vm.web3.toHex(asset._id))
      let assetIdHex = vm.web3.toHex(asset._id)
      $q((resolve, reject) => {                  
        vm.assetManagerContract.createAsset.sendTransaction(assetIdHex, 0, asset.sellerWallet, asset.title, 10000, 0xD1A421A5F199cd16Ca49778841CB88053768d5f1, 0, 10, 1, vm.gas, (err, trxid) => {
          console.log('trxid: ' + trxid)
          if (err) {
            reject(err)
          } else {
            resolve(trxid)
          }
        })          
      })
      .then((trxid) => {
        // $state.go('assets.view', {
        //   assetId: res._id
        // });          
      })

    }

  }

}())