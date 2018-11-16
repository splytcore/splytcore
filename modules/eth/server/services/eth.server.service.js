'use strict';

const Web3 = require('web3')
const path = require('path')
const async = require('async')
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
// const masterPrivateKey = '56c94e8a22948356615b861b5f4e048055812518b864bcc8f93496cf6dbb7bf1'

let masterWallet  = config.ethereum.masterWallet

// const assetManagerABI = AssetManager.abi;
// const splytManagerABI = SplytManager.abi;
// const orderManagerABI = OrderManager.abi;
// const arbitrationManagerABI = ArbitrationManager.abi;
// const reputationManagerABI = ReputationManager.abi;

//once we have the splytManager address, we can retrieve address of the other managers
const splytManagerAddress = config.ethereum.splytManagerAddress
console.log('splytManagerAddress: ' + splytManagerAddress)

let accounts //all accounts in this geth/parity client

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

const defaultGas = {
  from: masterWallet,
  gasPrice: 2000000,   //maximum price per gas
  gas: 4700000 //max number of gas to be used  
}

//check if connect to geth node
console.log('trying to connect to ' + config.ethereum.url)
web3.eth.net.isListening()
.then((result) => {
  console.log('connecting to geth host node...' + host)  
  return web3.eth.getBlockNumber()
})
.then((blockNumber) => {  
    console.log('version: ' + web3.version)
    console.log('current block: ' + blockNumber)   
    setGasPrice(blockNumber)
    return web3.eth.getAccounts()
})
.then((res_accounts) => {
  accounts = res_accounts
  console.log(accounts)

  splytManager = new web3.eth.Contract(SplytManager.abi, splytManagerAddress)      
  return 
}).then(() => {
  
 splytManager.methods.assetManager().call()
  .then((address) => {
    console.log('assetManager address: ' + address)  
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

  // get master token balance
  splytManager.methods.getBalance(masterWallet).call()  
  .then((balance) => {
    console.log('master wallet SatToken balance: ' + balance)  
    if (balance < 1) {
      exports.initUser(masterWallet)
    }
  }).catch((err) => {
    console.log('error connecting to web3')
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

//by default unlock for 1 hour
exports.unlockAccount = function(account, pw) {
  // let duration = web3.utils.toHex(0)
  return web3.eth.personal.unlockAccount(account, pw)
}

// exports.lockAccount = function(account, pw) {

//   web3.eth.personal.lockAccount(account, pw, )
//   .then(() => {
//     console.log('account locked!!')
//   })
//   .catch((err) => {
//     console.log('error unlocking account: %s  %s', account, err.toString())
//   })
// }


//TODO: use for testnet network like ropsten or rinky
exports.signTrx = function(to, from, privateKey, encodedABI) {

  let trx = {
    to: to,
    from: from,
    gasPrice: defaultGas.gasPrice,
    gas: defaultGas.gas,
    data: encodedABI
  }
  
  let signedTrx = web3.eth.accounts.signTransaction(trx, privateKey)
  return web3.eth.sendSignedTransaction(signedTrx.rawTransaction)

}


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


  // asset.marketPlaces.push(defaultMarketPlace) //hard code for now
  asset.marketPlacesAmount.push(2) //hard code for now

  // console.log(asset)  

  let trx = {
      from: asset.seller,
      gasPrice: defaultGas.gasPrice,   //maximum price per gas
      gas: defaultGas.gas //max number of gas to be used      
  }

  console.log('trx for gas')
  console.log(trx)

  return assetManager.methods.createAsset(
    prepend0x(asset._id), 
    asset.term, 
    asset.seller, 
    web3.utils.toHex(asset.title),
    asset.totalCost,
    Math.floor(asset.expDate.getTime()/1000),  //convert to seconds
    asset.marketPlaces[0].toString(),
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

  // console.log(order)  

  let trx = {
      from: order.buyerWallet,
      gasPrice: defaultGas.gasPrice,   //maximum price per gas
      gas: defaultGas.gas //max number of gas to be used      
  }

  let orderIdHex = prepend0x(order._id.toString())
  
  console.log('orderIdHex: ' + orderIdHex)

  return orderManager.methods.purchase(
    orderIdHex, 
    order.assetAddress, 
    parseInt(order.quantity), 
    order.trxAmount
    ).send(trx)
  
}

exports.createArbitration = function(arbitration) {

  console.log(arbitration)  

  let trx = {
      from: arbitration.reporterWallet,
      gasPrice: defaultGas.gasPrice,   //maximum price per gas
      gas: defaultGas.gas //max number of gas to be used      
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

exports.setArbitrator = function(arbitrationId, arbitrator) {

  let trx = {
      from: masterWallet,
      gasPrice: defaultGas.gasPrice,   //maximum price per gas
      gas: defaultGas.gas //max number of gas to be used      
  }

  let idHex = prepend0x(arbitrationId.toString())
  
  console.log('arbitrationIdHex: ' + idHex)

  return arbitrationManager.methods.setArbitrator(
    idHex, 
    arbitrator
    ).send(trx)
  
}


exports.set2xStakeByReporter = function(arbitrationId, reporter) {

  let trx = {
      from: reporter,
      gasPrice: defaultGas.gasPrice,   //maximum price per gas
      gas: defaultGas.gas //max number of gas to be used      
  }

  let idHex = prepend0x(arbitrationId.toString())
  
  console.log('arbitrationIdHex: ' + idHex)

  return arbitrationManager.methods.set2xStakeByReporter(
    idHex
    ).send(trx)
  
}

exports.set2xStakeBySeller = function(arbitrationId, seller) {

  let trx = {
      from: seller,
      gasPrice: defaultGas.gasPrice,   //maximum price per gas
      gas: defaultGas.gas //max number of gas to be used      
  }


  let idHex = prepend0x(arbitrationId.toString())
  
  console.log('arbitrationIdHex: ' + idHex)

  return arbitrationManager.methods.set2xStakeBySeller(
    idHex
    ).send(trx)
  
}

exports.setWinner = function(arbitrationId, arbitrator, winner) {

  let trx = {
      from: arbitrator,
      gasPrice: defaultGas.gasPrice,   //maximum price per gas
      gas: defaultGas.gas //max number of gas to be used      
  }

  let idHex = prepend0x(arbitrationId.toString())
  
  console.log('arbitrationIdHex: ' + idHex)

  return arbitrationManager.methods.setWinner(
    idHex,
    web3.utils.toHex(winner)
    ).send(trx)
  
}


exports.createReputation = function(reputation) {

  console.log(reputation)  

  let trx = {
      from: reputation.fromWallet,
      gasPrice: defaultGas.gasPrice,   //maximum price per gas
      gas: defaultGas.gas //max number of gas to be used      
  }


  return reputationManager.methods.createRate(
    reputation.wallet, 
    reputation.rating 
    ).send(trx)
  
}


exports.requestRefund = function(orderId, buyer) {

  let trx = {
      from: buyer,
      gasPrice: defaultGas.gasPrice,   //maximum price per gas
      gas: defaultGas.gas //max number of gas to be used      
  }


  return orderManager.methods.requestRefund(
    prepend0x(orderId) 
    ).send(trx)
  
}


exports.approveRefund = function(orderId, seller) {

  let trx = {
      from: seller,
      gasPrice: defaultGas.gasPrice,   //maximum price per gas
      gas: defaultGas.gas //max number of gas to be used      
  }


  return orderManager.methods.approveRefund(
    prepend0x(orderId) 
    ).send(trx)
  
}

exports.addMarketPlace = function(assetId, marketPlace, wallet) {

  console.log("assetId: " + assetId)  
  console.log("marketPlace: " + marketPlace)  

  let trx = {
      from: wallet,
      gasPrice: defaultGas.gasPrice,   //maximum price per gas
      gas: defaultGas.gas //max number of gas to be used      
  }


  return assetManager.methods.addMarketPlaceByAssetId(
    prepend0x(assetId, marketPlace)
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

exports.getContributionsLength = function(orderId) {
  let orderIdHex = prepend0x(orderId)
  return orderManager.methods.getContributionsLength(orderIdHex).call()
}

exports.getContributionByOrderIdAndIndex = function(orderId, index) {
  let orderIdHex = prepend0x(orderId)
  return orderManager.methods.getContributionByOrderIdAndIndex(orderIdHex, index).call()
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

exports.initUser = function(account) {
  
  let trx = {
      from: masterWallet,
      gasPrice: defaultGas.gasPrice,   //maximum price per gas
      gas: defaultGas.gas //max number of gas to be used      
  }

  return satToken.methods.initUser(account).send(trx)

}

exports.getAssetInfoByAssetId = function(assetId) {
  console.log('get asset info from contracts...')  
  let assetIdHex = prepend0x(assetId)
  return assetManager.methods.getAssetInfoByAssetId(assetIdHex).call()         
}

exports.getAssetInfoByAddress = function(address) {
  console.log('get asset info from contracts...')  
  return assetManager.methods.getAssetInfoByAddress(address).call()         
}

exports.isFractionalOrderExists = function(assetAddress) {
  console.log('asset address: ' + assetAddress)  
  return orderManager.methods.isFractionalOrderExists(assetAddress).call()         
}


exports.getAssetInfoByIndex = function(index) {
  return assetManager.methods.getAssetInfoByIndex(index).call()         
}

exports.getTransaction = function(trxHash) {
  return web3.eth.getTransaction(trxHash)         
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


exports.getMarketPlacesLengthByAssetId = function(assetId) {
  console.log('getting marketplaces for id ' + assetId) 
  return assetManager.methods.getMarketPlacesLengthByAssetId(prepend0x(assetId)).call()         
}

exports.getMarketPlaceByAssetIdAndIndex = function(assetId, index) {
  console.log('getting marketplaces for id ' + assetId) 
  return assetManager.methods.getMarketPlaceByAssetIdAndIndex(prepend0x(assetId), index).call()         
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

exports.createAccount2 = function(pw) {  
  console.log('creating account 2')
  return web3.eth.personal.newAccount(pw)
  // console.log('return accounts')
  // console.log(accounts)
  // return web3.eth.personal.newAccount('clippers')
}

exports.getTokenBalance = function(wallet) { 
  return splytManager.methods.getBalance(wallet).call()  
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

exports.lockWallet = function() {  
  return web3.eth.personal.lockAccount(wallet)
}

exports.addAccountByPrivateKey = function(privateKey, password) {  
  
  return new Promise((resolve, reject) => {

    let account  = web3.eth.accounts.privateKeyToAccount(prepend0x(privateKey))
    console.log('account: ' + account.address)
  
    let result2 = web3.eth.accounts.wallet.add(account, password)
    console.log('add wallet result')
    console.log(result2)

  })

}


exports.isAccountExist = function(account) {  

  console.log('lenght of accounts: ' + accounts.length)

  return new Promise((resolve, reject) => {
    accounts.forEach((a, index) => {
      if (a.toUpperCase().toString() === account.toUpperCase().toString()) {       
        console.log('found ' + account)
        console.log(index)
        resolve(true)
      } 
      if (parseInt(index) === (parseInt(accounts.length) - 1 )) {
        resolve(false)
      }
    })

  })


}



exports.getSplytServiceInfo = function() {  
  return ({
    tokenAddress: satTokenAddress,
    stakeAddress: stakeAddress,
    splytManagerAddress: splytManagerAddress,
    assetManagerAddress: assetManagerAddress,
    orderManagerAddress: orderManagerAddress,
    arbitrationManagerAddress: arbitrationManagerAddress,
    reputationManagerAddress: reputationManagerAddress,
    etherscanURL: config.ethereum.etherscanURL    
  })
}

//TODO: call this interval to update gas price
function setGasPrice(blockNumber) {
  
  console.log('setting gas price from block number: ' + blockNumber)
  let gasPrices = 0
  let lastBlockAvg

  let getBlock = new Promise((resolve, reject) => {
      web3.eth.getBlock(blockNumber, (err, resBlock) => {
        if(err) {
          reject(err)
        } else {
          resolve(resBlock)
        }
      })
  })
  
  getBlock
    .then((block) => {
      let length = parseInt(block.transactions.length)

      async.times(length, (index, callback) => {    
        console.log('index:' + index)
        web3.eth.getTransaction(block.transactions[index], function(err, transaction) {
          console.log(transaction.gasPrice)
          gasPrices += parseInt(transaction.gasPrice)
          callback(err)
        })
      }, (err) => {
        if (err) {
          console.log('error calculte gasPrice ')
          console.log(err)
        } else {
          lastBlockAvg = parseInt(gasPrices / length)
          defaultGas.gasPrice = lastBlockAvg < 20000000000 ? 20000000000 : lastBlockAvg   
          console.log('finished calculate gasPrice: ' + defaultGas.gasPrice)     
          console.log(defaultGas)
        }      
      })    
    })
    .catch((err) => {
       console.log('error calculte gasPrice 2')
    })

}
