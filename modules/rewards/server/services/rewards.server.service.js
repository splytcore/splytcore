'use strict';

const Web3 = require('web3')
const path = require('path')
const config = require(path.resolve('./config/config'))
const host = config.ethereum.url
const web3 = new Web3(new Web3.providers.HttpProvider(host))

console.log('initiate web3')


let rewardABI = [{"constant":false,"inputs":[],"name":"verifyFalse","outputs":[{"name":"","type":"bool"}],"payable":false,"stateMutability":"nonpayable","type":"function"},{"constant":true,"inputs":[],"name":"promisee","outputs":[{"name":"","type":"address"}],"payable":false,"stateMutability":"view","type":"function"},{"constant":true,"inputs":[],"name":"id","outputs":[{"name":"","type":"string"}],"payable":false,"stateMutability":"view","type":"function"},{"constant":true,"inputs":[],"name":"stage","outputs":[{"name":"","type":"uint8"}],"payable":false,"stateMutability":"view","type":"function"},{"constant":true,"inputs":[],"name":"promisor","outputs":[{"name":"","type":"address"}],"payable":false,"stateMutability":"view","type":"function"},{"constant":false,"inputs":[],"name":"setFulfilled","outputs":[{"name":"","type":"bool"}],"payable":false,"stateMutability":"nonpayable","type":"function"},{"constant":false,"inputs":[{"name":"_stage","type":"uint8"}],"name":"setStage","outputs":[{"name":"","type":"bool"}],"payable":false,"stateMutability":"nonpayable","type":"function"},{"constant":true,"inputs":[],"name":"getAmount","outputs":[{"name":"","type":"uint256"}],"payable":false,"stateMutability":"view","type":"function"},{"constant":false,"inputs":[],"name":"releaseReward","outputs":[{"name":"","type":"bool"}],"payable":false,"stateMutability":"nonpayable","type":"function"},{"constant":false,"inputs":[],"name":"verify","outputs":[{"name":"","type":"bool"}],"payable":false,"stateMutability":"nonpayable","type":"function"},{"inputs":[{"name":"_id","type":"string"}],"payable":true,"stateMutability":"payable","type":"constructor"},{"payable":true,"stateMutability":"payable","type":"fallback"}]

let rewardManagerABI = [{"constant":true,"inputs":[{"name":"_id","type":"string"}],"name":"getRewardById","outputs":[{"name":"","type":"address"}],"payable":false,"stateMutability":"view","type":"function"},{"constant":true,"inputs":[{"name":"_index","type":"uint256"}],"name":"getRewardByIndex","outputs":[{"name":"","type":"address"}],"payable":false,"stateMutability":"view","type":"function"},{"constant":false,"inputs":[{"name":"_id","type":"string"}],"name":"createReward","outputs":[{"name":"","type":"bool"}],"payable":false,"stateMutability":"nonpayable","type":"function"},{"constant":true,"inputs":[],"name":"getRewardsLength","outputs":[{"name":"","type":"uint256"}],"payable":false,"stateMutability":"view","type":"function"}]
let rewardManagerAddress = '0x00D75D555767fe9bC56c383fa94Ded07099d3a26'

let rewardManager
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
    rewardManager = new web3.eth.Contract(rewardManagerABI, rewardManagerAddress)    
    // console.log(rewardManager)
    return
})
.then(() => {      
    console.log('unlocking application wallet: ' + wallet)        
    return web3.eth.personal.unlockAccount(wallet, walletPassword, 1000)
}).then((result) => {      
  console.log('unlock result: ' + result)
  return result
}).then((isLocked) => {      
    console.log('lets lock the account back up for safetly meassure: ')        
    return web3.eth.personal.lockAccount(wallet)
}).then((result) => {      
  console.log('lock result: ' + result)
}).catch((err) => {
  console.log('error connecting to web3')
  console.log(err)
})




//   web3.eth.getBalance(appWallet)
//   .then(balance => {
//     appBalance = web3.utils.fromWei(balance)
//     if (appBalance > 10) {
//       console.log('App wallet balance:\t' + Chalk.green(appBalance + ' Ether'))
//     } else {
//       console.log('App Balance:\t' + Chalk.red(appBalance + ' Ether'))
//     }
//   })


exports.getRewardAmountById = function(rewardId) {

  return new Promise((resolve, reject) => {      
    exports.getRewardContractById(rewardId)
      .then((address) => {
        resolve(address)
      })
  })
  .then((address) => {
    return new web3.eth.Contract(rewardABI, address)     
  })
  .then((reward) => {    
    reward.id.call((err,result) => {
      console.log('reward id: ' + result)
    })
    return reward.methods.getAmount().call({ from: gas.from })
  })
  .catch((err) => {
    console.log(err)
  })

}

exports.createReward = function(rewardId) {
  // return rewardManager.methods.getRewardsLength().call({ from: gas.from })
  return exports.unlockWallet()
  .then(() => {
    return rewardManager.methods.createReward(web3.utils.toHex(rewardId)).send(gas)
  })
  .catch((err) => {
    console.log('create reward error: ' + err)
  })
  
}


exports.getRewardsLength = function() {
  return rewardManager.methods.getRewardsLength().call()
}

exports.getRewardContractById = function(rewardId) {
  return rewardManager.methods.getRewardById(web3.utils.toHex(rewardId)).call()
  
  // return new Promise((resolve, reject) => {
  //   resolve('0xfakeaddress')  
  // })

}

exports.getRewardContractByIndex = function(index) {
  return rewardManager.methods.getRewardByIndex(index).call()
  
  // return new Promise((resolve, reject) => {
  //   resolve('0xfakeaddress')  
  // })

}

exports.getRewardInfo = function(_rewardId) {

  let rewardId
  let amount
  let stage
  let promisor
  let promisee

  

  return new Promise((resolve, reject) => {            
      
      let rewardContract

      exports.getRewardContractById(_rewardId)
      .then((address) => {
        console.log('contract address: ' + address)
        return new web3.eth.Contract(rewardABI, address)     
      })
      .then((reward) => {            
        rewardContract = reward 
        return rewardContract.methods.id().call()            
      })         
      .then((id) => {            
        console.log('mongo id for reward: ' + id)
        rewardId = id
        return rewardContract.methods.promisor().call()    
      })               
      .then((promisor) => {            
        console.log('promisor id for reward: ' + promisor)
        promisor = promisor
        resolve(rewardId)
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


// exports.getRewardAmountById = function(rewardId) {

//   return new Promise((resolve, reject) => {    
//     exports.getRewardContractById(rewardId)
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