'use strict';

const Web3 = require('web3')
const path = require('path')
const config = require(path.resolve('./config/config'))
const host = config.ethereum.url
const web3 = new Web3(new Web3.providers.HttpProvider(host))
const utils = web3.utils._;

const SplytManager = require(path.resolve('./config/abi/SplytManager.json'))
const AssetManager = require(path.resolve('./config/abi/AssetManager.json'))
const OrderManager = require(path.resolve('./config/abi/OrderManager.json'))
const ArbitrationManager = require(path.resolve('./config/abi/ArbitrationManager.json'))
const ReputationManager = require(path.resolve('./config/abi/ReputationManager.json'))

console.log('initiate web3')


const privateKey = '2cd1cce5054f2c9d1b1bc8217f7f0db9ae881703fa8d74b5aacccd4ab0af38e1'
let masterWallet  
let defaultBuyer
let defaultSeller 
let defaultMarketPlace 
let defaultArbitrator


// const assetManagerABI = AssetManager.abi;
// const splytManagerABI = SplytManager.abi;
// const orderManagerABI = OrderManager.abi;
// const arbitrationManagerABI = ArbitrationManager.abi;
// const reputationManagerABI = ReputationManager.abi;

//once we have the splytManager address, we can retrieve address of the other managers
const splytManagerAddress = config.ethereum.splytManagerAddress
console.log('splytManagerAddress: ' + splytManagerAddress)

let splytManager;
let assetManager;
let orderManager;
let reputationManager;
let arbitrationManager;

const wallet = config.ethereum.wallet
const walletPassword = config.ethereum.password

const gas = {
  from: wallet,
  gasPrice: web3.utils.toHex(300000),   //maximum price per gas
  gas: web3.utils.toHex(4700000) //max number of gas to be used  
}

 console.log('toHex: ' + web3.utils.toHex(4700000))

//check if connect to geth node
web3.eth.net.isListening()
.then((result) => {
  console.log('connecting to geth host node...' + host)  
  return web3.eth.getBlockNumber()
})
.then((blockNumber) => {  
    console.log('version: ' + web3.version)
    console.log('current block: ' + blockNumber)   
    return web3.eth.getAccounts()
})
.then((accounts) => {
  console.log(accounts)
  console.log('master wallet: ' + accounts[0])
  masterWallet = accounts[0]
  defaultBuyer = accounts[0]
  defaultSeller = accounts[1]
  defaultMarketPlace = accounts[2]
  defaultArbitrator = accounts[3]

  splytManager = new web3.eth.Contract(SplytManager.abi, splytManagerAddress)      
  return 
}).then(() => {
  
 splytManager.methods.assetManager().call()
  .then((address) => {
    console.log('splytManager address: ' + address);    
       assetManager = new web3.eth.Contract(AssetManager.abi, address)    
  })
 
  splytManager.methods.orderManager().call()
  .then((address) => {
    console.log('orderManager address: ' + address);    
    orderManager = new web3.eth.Contract(OrderManager.abi, address)    
  })

 splytManager.methods.arbitrationManager().call()
  .then((address) => {
    console.log('arbitrationManager address: ' + address);    
    arbitrationManager = new web3.eth.Contract(ArbitrationManager.abi, address)    
  })
  
  splytManager.methods.reputationManager().call()
  .then((address) => {
    console.log('reputationManager address: ' + address);    
    reputationManager = new web3.eth.Contract(ReputationManager.abi, address)    
  })  
  return
}).then(() => {      
//   console.log('unlock result: ' + result)
//   return result
// }).then((isLocked) => {      
//     web3.eth.personal.unlockAccount(wallet, walletPassword, 1000)
//     console.log('lets lock the account back up for safetly meassure: ')        
//     return web3.eth.personal.lockAccount(wallet)
// }).then((result) => {      
//   console.log('lock result: ' + result)
  return
}).catch((err) => {
  console.log('error connecting to web3')
  console.log(err)
})


exports.signTrx = function(trx, privateKey) {
  return web3.eth.accounts.signTransaction(trx, privateKey)
}

// exports.getAssetAmountById = function(assetId) {

//   return new Promise((resolve, reject) => {      
//     exports.getassetContractById(assetId)
//       .then((address) => {
//         resolve(address)
//       })
//   })
//   .then((address) => {
//     return new web3.eth.Contract(assetABI, address)     
//   })
//   .then((asset) => {    
//     asset.id.call((err,result) => {
//       console.log('asset id: ' + result)
//     })
//     return asset.methods.getAmount().call({ from: gas.from })
//   })
//   .catch((err) => {
//     console.log(err)
//   })

// }

exports.getSplytManagerABI = function() {
  // return assetManager.methods.getassetsLength().call({ from: gas.from })
  return SplytManager.abi;
}

exports.getAssetManagerABI = function() {
  // return assetManager.methods.getassetsLength().call({ from: gas.from })
  return AssetManager.abi;
}

exports.getOrderManagerABI = function() {
  // return assetManager.methods.getassetsLength().call({ from: gas.from })
  return OrderManager.abi;
}

exports.getArbitrationManagerABI = function() {
  // return assetManager.methods.getassetsLength().call({ from: gas.from })
  return ArbitrationManager.abi;
}

exports.getReputationManagerABI = function() {
  // return assetManager.methods.getassetsLength().call({ from: gas.from })
  return ReputationManager.abi;
}


exports.createAsset = function(asset) {
  // return assetManager.methods.getassetsLength().call({ from: gas.from })
  // return exports.unlockWallet()
  // .then(() => {
    


  asset.marketPlaces.push(defaultMarketPlace) //hard code for now
  asset.marketPlacesAmount.push(2) //hard code for now
  asset.seller = defaultSeller

  console.log(asset)

  return assetManager.methods.createAsset(
    web3.utils.toHex(asset._id), 
    asset.term, 
    asset.seller, 
    web3.utils.toHex(asset.title),
    asset.totalCost,
    asset.expDate.getTime()/1000,
    asset.marketPlaces[0],
    asset.marketplacesAmount[0],
    asset.inventoryCount
    ).send(gas)
  
}


exports.getAssetsLength = function() {
  return assetManager.methods.getAssetsLength().call()
}

exports.getAssetContractById = function(assetId) {
  console.log('assetId: ' + assetId)
  let assetIdHex = web3.utils.toHex(assetId)
  console.log('assetId in Hex: ' + assetIdHex)
  return assetManager.methods.getassetById(assetIdHex).call()
}

exports.getAssetContractByIndex = function(index) {
  return assetManager.methods.getAssetByIndex(index).call()
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

  // return new Promise((resolve, reject) => {            
      
  //     let assetContract

  //     exports.getAssetContractById(_assetId)
  //     .then((address) => {
  //       console.log('contract address: ' + address)
  //       if (address.indexOf('0x00000000000000') > -1) {
  //         console.log('address not found')
  //         return reject('No contract address found. Not yet mined?')
  //       } else {
  //         result.address = address
  //         return new web3.eth.Contract(ssetABI, address)     
  //       }
  //     })            
  //     .then((asset) => {            
  //       assetContract = asset 
  //       return web3.eth.getBalance(result.address)                      
  //     })         
  //     .then((assetAmount) => {   
  //       console.log('asset amt: ' + assetAmount)                 
  //       result.ether = web3.utils.fromWei(assetAmount, 'ether')
  //       return assetContract.methods.id().call()            
  //     })         
  //     .then((id) => {            
  //       console.log('mongo id for asset: ' + id)
  //       result.assetId = id
  //       return assetContract.methods.promisor().call()    
  //     })                     
  //     .then((promisor) => {            
  //       console.log('promisor: ' + promisor)
  //       result.promisor = promisor
  //       return assetContract.methods.promisee().call()
  //     })               
  //     .then((promisee) => {            
  //       console.log('promisee: ' + promisee)
  //       result.promisee = promisee        
  //       return assetContract.methods.stage().call()
  //     })                           
  //     .then((stage) => {            
  //       console.log('stage: ' + stage)
  //       result.stage = stage        
  //       resolve(result)
  //     })                                 
  //     .catch((err) => {
  //       console.log(err)
  //       reject(err)
  //     })
  // })

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
