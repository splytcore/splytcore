'use strict';

const Web3 = require('web3')
const path = require('path')
const config = require(path.resolve('./config/config'))
const host = config.ethereum.url
const web3 = new Web3(new Web3.providers.HttpProvider(host))

console.log('initiate web3')


const privatekey = '2cd1cce5054f2c9d1b1bc8217f7f0db9ae881703fa8d74b5aacccd4ab0af38e1'

let assetABI = [{"constant":false,"inputs":[],"name":"verifyFalse","outputs":[{"name":"","type":"bool"}],"payable":false,"stateMutability":"nonpayable","type":"function"},{"constant":true,"inputs":[],"name":"promisee","outputs":[{"name":"","type":"address"}],"payable":false,"stateMutability":"view","type":"function"},{"constant":true,"inputs":[],"name":"id","outputs":[{"name":"","type":"string"}],"payable":false,"stateMutability":"view","type":"function"},{"constant":true,"inputs":[],"name":"stage","outputs":[{"name":"","type":"uint8"}],"payable":false,"stateMutability":"view","type":"function"},{"constant":true,"inputs":[],"name":"promisor","outputs":[{"name":"","type":"address"}],"payable":false,"stateMutability":"view","type":"function"},{"constant":false,"inputs":[],"name":"setFulfilled","outputs":[{"name":"","type":"bool"}],"payable":false,"stateMutability":"nonpayable","type":"function"},{"constant":false,"inputs":[{"name":"_stage","type":"uint8"}],"name":"setStage","outputs":[{"name":"","type":"bool"}],"payable":false,"stateMutability":"nonpayable","type":"function"},{"constant":true,"inputs":[],"name":"getAmount","outputs":[{"name":"","type":"uint256"}],"payable":false,"stateMutability":"view","type":"function"},{"constant":false,"inputs":[],"name":"releaseasset","outputs":[{"name":"","type":"bool"}],"payable":false,"stateMutability":"nonpayable","type":"function"},{"constant":false,"inputs":[],"name":"verify","outputs":[{"name":"","type":"bool"}],"payable":false,"stateMutability":"nonpayable","type":"function"},{"inputs":[{"name":"_id","type":"string"},{"name":"_promisor","type":"address"}],"payable":true,"stateMutability":"payable","type":"constructor"},{"payable":true,"stateMutability":"payable","type":"fallback"}]
let assetManagerABI = [{"constant":true,"inputs":[{"name":"_id","type":"string"}],"name":"getassetById","outputs":[{"name":"","type":"address"}],"payable":false,"stateMutability":"view","type":"function"},{"constant":true,"inputs":[{"name":"_index","type":"uint256"}],"name":"getassetByIndex","outputs":[{"name":"","type":"address"}],"payable":false,"stateMutability":"view","type":"function"},{"constant":false,"inputs":[{"name":"_id","type":"string"}],"name":"createasset","outputs":[{"name":"","type":"bool"}],"payable":false,"stateMutability":"nonpayable","type":"function"},{"constant":true,"inputs":[],"name":"getassetsLength","outputs":[{"name":"","type":"uint256"}],"payable":false,"stateMutability":"view","type":"function"}]

let assetManagerAddress = '0x422b09aad8100348Fd25E05Dd16122aD91e8b884'

let assetManager
const wallet = config.ethereum.wallet
const walletPassword = config.ethereum.password

const gas = {
  from: wallet,
  gasPrice: web3.utils.toHex(300000),   //maximum price per gas
  gas: web3.utils.toHex(4700000) //max number of gas to be used  
}

//check if connect to geth node
web3.eth.net.isListening()
.then((result) => {
  console.log('connecting to geth host node...' + host)  
  return web3.eth.getBlockNumber()
})
.then((blockNumber) => {  
    console.log('version: ' + web3.version)
    console.log('current block: ' + blockNumber)   
    assetManager = new web3.eth.Contract(assetManagerABI, assetManagerAddress)        
    return
// })
// .then(() => {          
//     return web3.eth.getBalance(wallet)
// }).then((balance) => {      
//     console.log('Balance: ' + web3.utils.fromWei(balance, 'ether'))        
//     return web3.eth.personal.unlockAccount(wallet, walletPassword, 1000)        
// }).then((result) => {      
//   console.log('unlock result: ' + result)
//   return result
// }).then((isLocked) => {      
//     console.log('lets lock the account back up for safetly meassure: ')        
//     return web3.eth.personal.lockAccount(wallet)
// }).then((result) => {      
//   console.log('lock result: ' + result)
}).catch((err) => {
  console.log('error connecting to web3')
  console.log(err)
})


exports.getAssetAmountById = function(assetId) {

  return new Promise((resolve, reject) => {      
    exports.getassetContractById(assetId)
      .then((address) => {
        resolve(address)
      })
  })
  .then((address) => {
    return new web3.eth.Contract(assetABI, address)     
  })
  .then((asset) => {    
    asset.id.call((err,result) => {
      console.log('asset id: ' + result)
    })
    return asset.methods.getAmount().call({ from: gas.from })
  })
  .catch((err) => {
    console.log(err)
  })

}

exports.createAsset = function(assetId) {
  // return assetManager.methods.getassetsLength().call({ from: gas.from })
  return exports.unlockWallet()
  .then(() => {
    return assetManager.methods.createasset(web3.utils.toHex(assetId)).send(gas)
  })
  .catch((err) => {
    console.log('create asset error: ' + err)
  })
  
}


exports.getAssetsLength = function() {
  return assetManager.methods.getassetsLength().call()
}

exports.getAssetContractById = function(assetId) {
  console.log('assetId: ' + assetId)
  let assetIdHex = web3.utils.toHex(assetId)
  console.log('assetId in Hex: ' + assetIdHex)
  return assetManager.methods.getassetById(assetIdHex).call()
}

exports.getAssetContractByIndex = function(index) {
  return assetManager.methods.getassetByIndex(index).call()
}

exports.getAssetInfo = function(_assetId) {

  let result = {

  }
  // let assetId
  // let amount
  // let stage
  // let promisor
  // let promisee
  // let contractAddress
  // let assetEther

  return new Promise((resolve, reject) => {            
      
      let assetContract

      exports.getassetContractById(_assetId)
      .then((address) => {
        console.log('contract address: ' + address)
        if (address.indexOf('0x00000000000000') > -1) {
          console.log('address not found')
          return reject('No contract address found. Not yet mined?')
        } else {
          result.address = address
          return new web3.eth.Contract(assetABI, address)     
        }
      })            
      .then((asset) => {            
        assetContract = asset 
        return web3.eth.getBalance(result.address)                      
      })         
      .then((assetAmount) => {   
        console.log('asset amt: ' + assetAmount)                 
        result.ether = web3.utils.fromWei(assetAmount, 'ether')
        return assetContract.methods.id().call()            
      })         
      .then((id) => {            
        console.log('mongo id for asset: ' + id)
        result.assetId = id
        return assetContract.methods.promisor().call()    
      })                     
      .then((promisor) => {            
        console.log('promisor: ' + promisor)
        result.promisor = promisor
        return assetContract.methods.promisee().call()
      })               
      .then((promisee) => {            
        console.log('promisee: ' + promisee)
        result.promisee = promisee        
        return assetContract.methods.stage().call()
      })                           
      .then((stage) => {            
        console.log('stage: ' + stage)
        result.stage = stage        
        resolve(result)
      })                                 
      .catch((err) => {
        console.log(err)
        reject(err)
      })
  })

}

exports.unlockWallet = function() {  
  return web3.eth.personal.unlockAccount(wallet, walletPassword, 1000) //stay open for 1 second only
}

exports.lockWallet = function() {  
  return web3.eth.personal.lockAccount(wallet)
}


// exports.getassetAmountById = function(assetId) {

//   return new Promise((resolve, reject) => {    
//     exports.getassetContractById(assetId)
//     .then((address) => {
//       resolve(address)
//     })
//   })
//   .then((address) => {
//     console.log('address: ' + address)
//     return new Promise((resolve, reject) => {
//       setTimeout(function() {        
//         resolve (88)  
//       }, 5000)
//     })    
//   })
//   .then((amount) => {
//     console.log('amount: ' + amount)
//     return amount
//   })
//   .then((amount) => {
//     console.log('step: ' + amount)
//     return 2
//   })
//   .then((amount) => {
//     console.log('step: ' + amount)
//     return 4
//   })
//   .then((amount) => {
//     console.log('step: ' + amount)
//     return 5  vaultContract.methods.changeEscapeHatch(web3.utils.toHex(escapeHatch.name.split('\u0000')[0]), escapeHatch.escapeHatchCaller, escapeHatch.escapeHatchDestination)
//   })
//   .then((amount) => {
//     console.log('step: ' + amount)
//     return 6
//   })
//   .then((amount) => {
//     console.log('step: ' + amount)
//     return 7
//   })
//   .then((amount) => {
//     console.log('step: ' + amount)
//     return 8
//   })
//   .then((amount) => {
//     console.log('step: ' + amount)
//     return 9
//   })
//   .then((amount) => {
//     console.log('step: ' + amount)
//     return 10
//   })
//   .then((amount) => {
//     console.log('step: ' + amount)
//     return 11
//   })

// }
