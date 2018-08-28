
(function () {
  'use strict';

  angular
    .module('eth')
    .service('EthService', EthService);

  EthService.$inject = ['$http', '$window'];

  function EthService($http, $window) {
    let vm = this
  
    vm.createAsset = createAsset;
    vm.purchase = purchase;

    vm.publicKey = '0xD1A421A5F199cd16Ca49778841CB88053768d5f1'
    vm.privateKey = 'c165c12ca90658dfc7906c11dde6a7e5f9c67d49476649d9a26bb2e65578b352'  
    
    vm.web3 = new Web3($window.web3.currentProvider);
    
    console.log('is connected: ' + vm.web3.isConnected())
    
    console.log('web3 accounts: ' + vm.web3.eth.accounts)
    vm.myWallet  = vm.web3.eth.accounts;
    
    // console.log('blockNumber: ' + vm.web3.eth.blockNumber)

    // Get the contract instance using your contract's abi and address:    
    vm.assetABI = vm.web3.eth.contract([{"constant":false,"inputs":[],"name":"verifyFalse","outputs":[{"name":"","type":"bool"}],"payable":false,"stateMutability":"nonpayable","type":"function"},{"constant":true,"inputs":[],"name":"promisee","outputs":[{"name":"","type":"address"}],"payable":false,"stateMutability":"view","type":"function"},{"constant":true,"inputs":[],"name":"id","outputs":[{"name":"","type":"string"}],"payable":false,"stateMutability":"view","type":"function"},{"constant":true,"inputs":[],"name":"stage","outputs":[{"name":"","type":"uint8"}],"payable":false,"stateMutability":"view","type":"function"},{"constant":true,"inputs":[],"name":"promisor","outputs":[{"name":"","type":"address"}],"payable":false,"stateMutability":"view","type":"function"},{"constant":false,"inputs":[],"name":"setFulfilled","outputs":[{"name":"","type":"bool"}],"payable":false,"stateMutability":"nonpayable","type":"function"},{"constant":false,"inputs":[{"name":"_stage","type":"uint8"}],"name":"setStage","outputs":[{"name":"","type":"bool"}],"payable":false,"stateMutability":"nonpayable","type":"function"},{"constant":true,"inputs":[],"name":"getAmount","outputs":[{"name":"","type":"uint256"}],"payable":false,"stateMutability":"view","type":"function"},{"constant":false,"inputs":[],"name":"releaseAsset","outputs":[{"name":"","type":"bool"}],"payable":false,"stateMutability":"nonpayable","type":"function"},{"constant":false,"inputs":[],"name":"verify","outputs":[{"name":"","type":"bool"}],"payable":false,"stateMutability":"nonpayable","type":"function"},{"inputs":[{"name":"_id","type":"string"},{"name":"_promisor","type":"address"}],"payable":true,"stateMutability":"payable","type":"constructor"},{"payable":true,"stateMutability":"payable","type":"fallback"}]);

    vm.assetManagerABI = vm.web3.eth.contract([{"constant":true,"inputs":[{"name":"_id","type":"string"}],"name":"getAssetById","outputs":[{"name":"","type":"address"}],"payable":false,"stateMutability":"view","type":"function"},{"constant":true,"inputs":[{"name":"_index","type":"uint256"}],"name":"getAssetByIndex","outputs":[{"name":"","type":"address"}],"payable":false,"stateMutability":"view","type":"function"},{"constant":false,"inputs":[{"name":"_id","type":"string"}],"name":"createAsset","outputs":[{"name":"","type":"bool"}],"payable":false,"stateMutability":"nonpayable","type":"function"},{"constant":true,"inputs":[],"name":"getAssetsLength","outputs":[{"name":"","type":"uint256"}],"payable":false,"stateMutability":"view","type":"function"}]);

    vm.assetManagerAddress = '0x422b09aad8100348Fd25E05Dd16122aD91e8b884'

    vm.assetManagerContract = vm.assetManagerABI.at(vm.assetManagerAddress)

    // Call a function of the contract:
    // vm.assetContract.stage((err, res) => {
    //   console.log('gettint stage: ' + res)
    // })

    vm.gas = {
      // from: vm.publicKey,
      gasPrice: vm.web3.toHex(3000000),   //maximum price per gas
      gas: vm.web3.toHex(4600000) //max number of gas to be used  
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

    function createAsset(assetId) {

      console.log('toHex: ' + vm.web3.toHex(assetId))
      let assetIdHex = vm.web3.toHex(assetId)
      $q((resolve, reject) => {                  
        vm.assetManagerContract.createAsset.sendTransaction(assetIdHex, vm.gas, (err, trxid) => {
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