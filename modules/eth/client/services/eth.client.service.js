
(function () {
  'use strict';

  angular
    .module('eth')
    .service('EthService', EthService);

  EthService.$inject = ['$http', '$window', '$q'];

  function EthService($http, $window, $q) {
    let vm = this
  
    vm.getSplytServiceInfo = getSplytServiceInfo;

    vm.createAsset = createAsset;
    vm.purchase = purchase;
    
    vm.getDefaultWallets = getDefaultWallets;

    vm.getAllABI = getAllABI;
    vm.getAssetInfo = getAssetInfo;
    
    vm.getAssetStatus = getAssetStatus;

    vm.getAssetsLength = getAssetsLength;
    vm.getAddressByAssetId = getAddressByAssetId;
 
    vm.getTokenBalance = getTokenBalance;
 
    vm.getUserBalances = getUserBalances;
    vm.addMarketPlace = addMarketPlace;
    vm.createNewWallet = createNewWallet;


    vm.web3 = new Web3($window.web3.currentProvider);
    
    console.log('is connected: ' + vm.web3.isConnected())
    console.log('web3 accounts: ' + vm.web3.eth.accounts)
    
    vm.splytManagerContract
    vm.orderManagerContract
    vm.assetManagerContract
    vm.arbitrationManagerContract
    vm.reputationManagerContract

    //NOT USED. THIS IS ONLY FOR CLIENT SIDE USING METAMMASK EXECUTING THE CONTRACTS
    // getAllABI()
    //   .success((config) => {
    //       console.log(config);
    //       vm.splytManagerContract = vm.web3.eth.contract(config.splytManagerABI).at(config.splytManagerAddress)
    //       vm.splytManagerContract.getManagerTrackerAddress((err, result) => {
    //         console.log('ManagerTrackerAddress: ' + result)
    //       })

    //       vm.splytManagerContract.assetManager((err, address) => {
    //         console.log('assetManager ' + address)
    //         vm.assetManagerContract = vm.web3.eth.contract(config.assetManagerABI).at(address)      
    //       })

    //       vm.splytManagerContract.orderManager((err, address) => {
    //         console.log('orderManager ' + address)
    //         vm.orderManagerContract = vm.web3.eth.contract(config.orderManagerABI).at(address) 
    //       })

    //       vm.splytManagerContract.arbitrationManager((err, address) => {
    //         console.log('arbitrationManager ' + address)
    //         vm.arbitrationManagerContract = vm.web3.eth.contract(config.arbitrationManagerABI).at(address) 
    //       })

    //       vm.splytManagerContract.reputationManager((err, address) => {
    //         console.log('reputationManager ' + address)
    //         vm.reputationManagerContract = vm.web3.eth.contract(config.reputationManagerABI).at(address) 
    //       })

    //       vm.splytManagerContract.owner((err, result) => {
    //         console.log('splytManagerContract owner ' + result)
    //       })

          // vm.assetContract.setFulfilled.sendTransaction(vm.gas, (err, trxid) => {
          //   console.log('trxid: ' + trxid)
          // })

          // console.log(vm.splytManagerContract.methods.getManagerTrackerAddress().call())
      // })
      // .error((err) => {
      //   console.log(err)
      // })

    vm.gas = {
      // from: vm.publicKey,
      gasPrice: vm.web3.toHex(3000000),   //maximum price per gas
      gas: vm.web3.toHex(4600000) //max number of gas to be used  
    }

    function createNewWallet(walletPassword) {    
      return $http.post('/api/eth/createNewAccount', { walletPassword: walletPassword })
    }

    function getAddressByAssetId(assetId, done) {
      console.log('assetId: ' + assetId)
      let assetIdHex = vm.web3.toHex(assetId)
      vm.assetManagerContract.getAddressById(assetIdHex, (err, address) => {
        done(err, address)
      })
          
    }


    function getAssetsLength() {
      // vm.assetManagerContract.getAssetsLength((err, length) => {
      //   console.log('number of listed assets ' + length)
      // })      
    }


    function addMarketPlace(assetId, marketPlace) {
      return $http.post('/api/eth/addMarketPlace', { assetId: assetId, marketPlace: marketPlace });
    }

    function getSplytWallets() {
      return $http.get('/api/eth/getDefaultWallets');
    }

    function getDefaultWallets() {
      return $http.get('/api/eth/getDefaultWallets');
    }

    function getTokenBalance() {
      vm.splytManagerContract.getBalance(vm.web3.eth.accounts, (err, balance) => {
        console.log(vm.web3.eth.accounts + ' tokens balance: ' + balance)
        return balance
      })

    }

    function getAssetInfo(assetId) {
      console.log('assetId: ' + assetId)
      let assetIdHex = vm.web3.toHex(assetId)
      $q((resolve, reject) => {        
        vm.assetManagerContract.getAddressById(assetIdHex, (err, address) => {
          resolve(address)
        })                
      })
      .then((address) => {
        console.log(address)
        let deferred = $q.defer()
        vm.assetManagerContract.getAssetInfo(address, (err, fields) => {
          console.log(fields)
          deferred.resolve('step 2')
        })
        return deferred.promise
      })
      .catch((err) => {
        console.log('error')
        console.log(err)
      })
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

    function getUserBalances() {
      return $http.get('/api/users/balances');
    }


    function getAllABI() {
      return $http.get('/api/abi/getAll');
    }

    function getSplytServiceInfo() {
      return $http.get('/api/eth/getSplytServiceInfo');
    }


    function getAssetStatus(assetId) {
      let assetIdHex = vm.web3.toHex(assetId)
      //anyone can call this function to pay promisee
      // vm.assetManagerContract.createAsset.sendTransaction(assetIdHex, vm.gas, (err, trxid) => {     
      vm.assetManagerContract.getAddressById(assetIdHex, (err, address) => {
        vm.assetManagerContract.getStatus(address, (err, status) => {
          console.log('status: ' + status)
          return status;
        })        
      })

    }

    function purchase(orderId, assetId) {
      let assetIdHex = vm.web3.toHex(assetId)
      let orderIdHex = vm.web3.toHex(orderId)
      //anyone can call this function to pay promisee
      // vm.assetManagerContract.createAsset.sendTransaction(assetIdHex, vm.gas, (err, trxid) => {     
      vm.assetManagerContract.getAddressById(assetIdHex, (err, address) => {
        vm.orderManagerContract.purchase.sendTransaction(orderIdHex, address, 1, 10000, vm.gas, (err, trxid) => {
          console.log('trxid: ' + trxid)
        })        
      })

    }


    function createRate(wallet, rating) { 
      vm.reputationManagerContract.createRate.sendTransaction(wallet, rating, vm.gas, (err, trxid) => {
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