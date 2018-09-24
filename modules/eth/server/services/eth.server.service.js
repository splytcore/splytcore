'use strict';

const Web3 = require('web3')
const path = require('path')
const config = require(path.resolve('./config/config'))
const host = config.ethereum.url
const web3 = new Web3(new Web3.providers.HttpProvider(host))

const SplytManager = require(path.resolve('./config/abi/SplytManager.json'))
const AssetManager = require(path.resolve('./config/abi/AssetManager.json'))
const OrderManager = require(path.resolve('./config/abi/OrderManager.json'))
const ArbitrationManager = require(path.resolve('./config/abi/ArbitrationManager.json'))
const ReputationManager = require(path.resolve('./config/abi/ReputationManager.json'))

const SatToken = require(path.resolve('./config/abi/SatToken.json')) //used to set tokens for accounts

console.log('initiate web3')

//only for dev
//master key has to be updated everytime rpctest starts or restarts
const masterPrivateKey = '56c94e8a22948356615b861b5f4e048055812518b864bcc8f93496cf6dbb7bf1'
const defaultBuyerPrivateKey = '7541a92083e326478c75180f8247ce914f9a1e3f4d23f99ec1d20f75527ccde8'

let masterWallet  
let defaultBuyer
let defaultSeller 
let defaultMarketPlace 
let defaultArbitrator
let defaultReporter //who flags an arbitration

// const assetManagerABI = AssetManager.abi;
// const splytManagerABI = SplytManager.abi;
// const orderManagerABI = OrderManager.abi;
// const arbitrationManagerABI = ArbitrationManager.abi;
// const reputationManagerABI = ReputationManager.abi;

//once we have the splytManager address, we can retrieve address of the other managers
const splytManagerAddress = config.ethereum.splytManagerAddress
console.log('splytManagerAddress: ' + splytManagerAddress)

let assetManagerAddress;
let orderManagerAddress;
let reputationManagerAddress;
let arbitrationManagerAddress;
let satTokenAddress;
let stakeAddress;


let splytManager;
let assetManager;
let orderManager;
let reputationManager;
let arbitrationManager;
let satToken

const wallet = config.ethereum.wallet
const walletPassword = config.ethereum.password

const gas = {
  from: masterWallet,
  gasPrice: web3.utils.toHex(3000000),   //maximum price per gas
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
  defaultSeller = accounts[0]
  defaultBuyer = accounts[1]
  defaultMarketPlace = accounts[2]
  defaultArbitrator = accounts[3]
  defaultReporter = accounts[4]
  splytManager = new web3.eth.Contract(SplytManager.abi, splytManagerAddress)      
  return 
}).then(() => {
  
 splytManager.methods.assetManager().call()
  .then((address) => {
    console.log('splytManager address: ' + address)  
    assetManagerAddress = address  
    assetManager = new web3.eth.Contract(AssetManager.abi, address)    
  })
 
  splytManager.methods.orderManager().call()
  .then((address) => {
    console.log('orderManager address: ' + address)
    orderManagerAddress = address
    orderManager = new web3.eth.Contract(OrderManager.abi, address)    
  })

 splytManager.methods.arbitrationManager().call()
  .then((address) => {
    console.log('arbitrationManager address: ' + address) 
    arbitrationManagerAddress = address    
    arbitrationManager = new web3.eth.Contract(ArbitrationManager.abi, address)    
  })
  
  splytManager.methods.reputationManager().call()
  .then((address) => {
    console.log('reputationManager address: ' + address) 
    reputationManagerAddress = address   
    reputationManager = new web3.eth.Contract(ReputationManager.abi, address)   
  })  

  splytManager.methods.stake().call()
  .then((address) => {
    console.log('stake address: ' + address) 
    stakeAddress = address
  })  


  splytManager.methods.satToken().call()
  .then((address) => {
    console.log('satToken address: ' + address)
    satTokenAddress = address   
    satToken = new web3.eth.Contract(SatToken.abi, address)  
  })  

  //get seller token balance
  splytManager.methods.getBalance(defaultSeller).call()  
  .then((balance) => {
    console.log('default seller SatToken balance: ' + balance)  
    if (balance < 1) {
      exports.initUser(defaultSeller)
    }
  })     

  splytManager.methods.getBalance(defaultBuyer).call()  
  .then((balance) => {
    console.log('default buyer SatToken balance: ' + balance)  
    if (balance < 1) {
      exports.initUser(defaultBuyer, defaultBuyerPrivateKey)
    }
  })     

  splytManager.methods.getBalance(defaultMarketPlace).call()  
  .then((balance) => {
    console.log('default marketPlace SatToken balance: ' + balance)  
    if (balance < 1) {
      exports.initUser(defaultMarketPlace, 'privateKey')
    }
  })     
  splytManager.methods.getBalance(defaultReporter).call()  
  .then((balance) => {
    console.log('default reporter SatToken balance: ' + balance)  
    if (balance < 1) {
      exports.initUser(defaultReporter, 'privateKey')
    }
  })     


  web3.eth.getBalance(defaultSeller)
  .then((balance) => {
    console.log('default seller Ether balance: ' + web3.utils.fromWei(balance))  
    if (balance < 1) {
      console.log('seller cannot perform any changes for contracts')
    }
  })      
  .catch((err) => {
    console.log(err)
  })


  web3.eth.getBalance(defaultReporter)
  .then((balance) => {
    console.log('default reporter Ether balance: ' + web3.utils.fromWei(balance))  
    if (balance < 1) {
      console.log('reporter cannot perform any changes for contracts')
    }
  })      
  .catch((err) => {
    console.log(err)
  })

  web3.eth.getBalance(defaultArbitrator)
  .then((balance) => {
    console.log('default arbitraitor Ether balance: ' + web3.utils.fromWei(balance))  
    if (balance < 1) {
      console.log('arbitrator cannot perform any changes for contracts')
    }
  })      
  .catch((err) => {
    console.log(err)
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


//TODO: use for testnet network
exports.getDefaultWallets = function(account, privateKey, encoded) {
  return ({ defaultSeller: defaultSeller, defaultBuyer: defaultBuyer, defaultMarketPlace: defaultMarketPlace, defaultArbitrator: defaultArbitrator, defaultReporter: defaultReporter })
}

//TODO: use for testnet network like ropsten or rinky
exports.signTrx = function(account, privateKey, encoded) {
  web3.eth.getTransactionCount(defaultSeller, function (err, nonce) {
    console.log("nonce: " + nonce)
    let rawTrx = {
      to: assetManagerAddress,
    // value": web3.utils.toHex(web3.utils.toWei("0.001", "ether")),
    // "chainId": 3
      nonce: nonce,
      data: encoded,
      from: account,
      gasPrice: web3.utils.toHex(300000),   //maximum price per gas
      gas: web3.utils.toHex(4700000) //max number of gas to be used  
    }

    web3.eth.accounts.signTransaction(rawTrx, privateKey)
    .then((signedTrx) => {
      web3.eth.sendSignedTransaction(signedTrx.rawTransaction)
    })
    .then((receipt) => {
      console.log("Transaction receipt: ", receipt)
    })
    .catch((err) => {
      console.error(err)
    })    
  })
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

function prepend0x(value) {
  return "0x" + value
}

exports.createAsset = function(asset) {


  asset.marketPlaces.push(defaultMarketPlace) //hard code for now
  asset.marketPlacesAmount.push(2) //hard code for now

  console.log(asset)  

  let trx = {
      from: defaultSeller,
      gasPrice: web3.utils.toHex(300000),   //maximum price per gas
      gas: web3.utils.toHex(4700000) //max number of gas to be used      
  }


  return assetManager.methods.createAsset(
    prepend0x(asset._id), 
    asset.term, 
    asset.seller, 
    web3.utils.toHex(asset.title),
    asset.totalCost,
    Math.floor(asset.expDate.getTime()/1000),
    asset.marketPlaces[0],
    asset.marketPlacesAmount[0],
    asset.inventoryCount
    ).send(trx)
    // .then((result) => {
    //   console.log('create asset: ')
    //   console.log(result)
    // })
    // .catch((err) => {
    //   console.log('create asset error')
    //   console.log(err)
    // })

  // exports.signTrx(encoded)
  
}

exports.purchase = function(order) {

  console.log(order)  

  let trx = {
      from: order.buyerWallet,
      gasPrice: web3.utils.toHex(300000),   //maximum price per gas
      gas: web3.utils.toHex(4700000) //max number of gas to be used      
  }

  let orderIdHex = prepend0x(order._id.toString())
  
  console.log('orderIdHex: ' + orderIdHex)

  return orderManager.methods.purchase(
    orderIdHex, 
    order.assetAddress, 
    order.quantity, 
    order.trxAmount
    ).send(trx)
  
}

exports.createArbitration = function(arbitration) {

  console.log(arbitration)  

  let trx = {
      from: arbitration.reporterWallet,
      gasPrice: web3.utils.toHex(300000),   //maximum price per gas
      gas: web3.utils.toHex(4700000) //max number of gas to be used      
  }

  let idHex = prepend0x(arbitration._id.toString())
  
  console.log('arbitrationIdHex: ' + idHex)

  console.log(idHex)
  console.log(arbitration.reporterWallet)
  console.log(arbitration.assetAddress)
  console.log(arbitration.reason)


  return arbitrationManager.methods.createArbitration(
    idHex, 
    arbitration.assetAddress, 
    arbitration.reason
    ).send(trx)
  
}


exports.createReputation = function(reputation) {

  console.log(reputation)  

  let trx = {
      from: reputation.fromWallet,
      gasPrice: web3.utils.toHex(300000),   //maximum price per gas
      gas: web3.utils.toHex(4700000) //max number of gas to be used      
  }


  return reputationManager.methods.createRate(
    reputation.wallet, 
    reputation.rating 
    ).send(trx)
  
}

exports.getAssetsLength = function() {
  return assetManager.methods.getAssetsLength().call()
}

exports.getOrdersLength = function() {
  return orderManager.methods.getOrdersLength().call()
}

exports.getArbitrationsLength = function() {
  return arbitrationManager.methods.getArbitrationsLength().call()
}
exports.getReputationsLength = function() {
  return reputationManager.methods.getReputationsLength().call()
}

exports.getAssetContractById = function(assetId) {
  console.log('assetId: ' + assetId)
  let assetIdHex = prepend0x(assetId)
  console.log('assetId in Hex: ' + assetIdHex)
  return assetManager.methods.getassetById(assetIdHex).call()
}

exports.getAssetContractByIndex = function(index) {
  return assetManager.methods.getAssetByIndex(index).call()
}

exports.initUser = function(account, privateKey) {
  
  let trx = {
      from: account,
      gasPrice: web3.utils.toHex(300000),   //maximum price per gas
      gas: web3.utils.toHex(4700000) //max number of gas to be used      
  }

  satToken.methods.initUser(account).send(trx)
    .then((result) => {
      console.log(result)
    })
    .catch((err) => {
      console.log(err)
    })
}

exports.getAssetInfoByAssetId = function(assetId) {
  console.log('get asset info from contracts...')  
  let assetIdHex = prepend0x(assetId)
  let assetAddress           
  return assetManager.methods.getAssetInfoByAssetId(assetIdHex).call()         
}

exports.getAssetInfoByIndex = function(index) {
  return assetManager.methods.getAssetInfoByIndex(index).call()         
}


exports.getOrderInfoByOrderId = function(orderId) {
  console.log('get order info from contracts...')  
  let orderIdHex = prepend0x(orderId)            
  return orderManager.methods.getOrderInfoByOrderId(orderIdHex).call()          
}

exports.getOrderInfoByIndex = function(index) {
  console.log('getting order for index ' + index)
  return orderManager.methods.getOrderInfoByIndex(parseInt(index)).call()         
}

exports.getArbitrationInfoByArbitrationId = function(arbitrationId) {
  console.log('getting arbitration for id ' + arbitrationId)
  
  return arbitrationManager.methods.getArbitrationInfoByArbitrationId(prepend0x(arbitrationId)).call()         
}


exports.getArbitrationInfoByIndex = function(index) {
  console.log('getting arbitration for index ' + index)
  
  return arbitrationManager.methods.getArbitrationInfoByIndex(parseInt(index)).call()         
}

exports.getReputationInfoByIndex = function(index) {
  console.log('getting reputation for index ' + index)
  
  return reputationManager.methods.getReputationInfoByIndex(parseInt(index)).call()         
}
// Returns just the summary of the reputation.
exports.getReputationInfoByWallet = function(wallet) {
  console.log('getting reputation for wallet ' + wallet)
  
  return reputationManager.methods.getReputationInfoByWallet(wallet).call()         
}

//Returns the detail of each rating
exports.getRateInfoByWalletAndIndex = function(wallet, index) {
  console.log('getting reputation for index ' + index)
  console.log('wallet: ' + index)
  return reputationManager.methods.getRateInfoByWalletAndIndex(wallet, parseInt(index)).call()         
}


exports.createAccount = function() {  
  console.log('creating account')
  return web3.eth.accounts.create()
  // console.log('return accounts')
  // console.log(accounts)
  // return web3.eth.personal.newAccount('clippers')
}

exports.getTokenBalance = function() { 
  return splytManager.methods.getBalance(defaultBuyer).call()  
}

exports.getEtherBalance = function(wallet) { 
  
  return web3.eth.getBalance(wallet)
  .then((balance) => {
    let ether =  web3.utils.fromWei(balance)
    return ether  
  })      
  .catch((err) => {
    console.log(err)
  })
}

exports.unlockWallet = function() {  
  return web3.eth.personal.unlockAccount(wallet, walletPassword, 1000) //stay open for 1 second only
}

exports.lockWallet = function() {  
  return web3.eth.personal.lockAccount(wallet)
}


exports.getSplytServiceInfo = function() {  
  return ({
    tokenAddress: satTokenAddress,
    stakeAddress: stakeAddress,
    splytManagerAddress: splytManagerAddress,
    assetManagerAddress: assetManagerAddress,
    orderManagerAddress: orderManagerAddress,
    arbitrationManagerAddress: arbitrationManagerAddress,
    reputationManagerAddress: reputationManagerAddress
  })
}
