'use strict';

const Web3 = require('web3')
const path = require('path')
const config = require(path.resolve('./config/config'))
const host = config.ethereum.url
const web3 = new Web3(new Web3.providers.HttpProvider(host))

console.log('initiate web3')

let rewardManagerABI = [{"constant":true,"inputs":[{"name":"_id","type":"string"}],"name":"getRewardById","outputs":[{"name":"","type":"address"}],"payable":false,"stateMutability":"view","type":"function"},{"constant":true,"inputs":[{"name":"_index","type":"uint256"}],"name":"getRewardByIndex","outputs":[{"name":"","type":"address"}],"payable":false,"stateMutability":"view","type":"function"},{"constant":false,"inputs":[{"name":"_id","type":"string"}],"name":"createReward","outputs":[{"name":"","type":"bool"}],"payable":false,"stateMutability":"nonpayable","type":"function"},{"constant":true,"inputs":[],"name":"getRewardsLength","outputs":[{"name":"","type":"uint256"}],"payable":false,"stateMutability":"view","type":"function"}]
let rewardManagerContractAddress
let rewardManagerContract

const gas = {
  from: config.ethereum.wallet,
  gas: web3.utils.toHex(300000),
  gasPrice: web3.utils.toHex(41000000000)
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
    rewardManagerContract = new web3.eth.Contract(rewardManagerABI, rewardManagerContractAddress)
})
.catch((err) => {
  console.log('error connecting to web3')
  console.log(err)
})


// const rewardContractABI = [
//   {
//     "constant": true,
//     "inputs": [],
//     "name": "test",
//     "outputs": [
//       {
//         "name": "",
//         "type": "bytes32"
//       }
//     ],
//     "payable": false,
//     "stateMutability": "pure",
//     "type": "function"
//   }
// ]
// const rewardContractAddress = '0x0'
// const rewardContract = new web3.eth.Contract(rewardContractABI, rewardContractAddress)


// try {
//   console.log(Chalk.yellow('Initializing GLOBAL client service Ethereum connection on ' + gethUrl))
//   web3 = new Web3(new Web3.providers.HttpProvider(gethUrl))

//   vaultContract = new web3.eth.Contract(vaultContractAbi, vaultContractAddress)
//   bankContract = new web3.eth.Contract(bankContractAbi, bankContractAddress)

//   gas = {
//     from: appWallet,
//     gas: web3.utils.toHex(300000),
//     gasPrice: web3.utils.toHex(41000000000)
//   }

//   web3.eth.getBalance(vaultContractAddress)
//   .then(balance => {
//     let vaultBalance = web3.utils.fromWei(balance)
//     console.log('Vault Balance:\t\t' + Chalk.green(vaultBalance, 'Ethers'))
//   })

//   web3.eth.getBalance(appWallet)
//   .then(balance => {
//     appBalance = web3.utils.fromWei(balance)
//     if (appBalance > 10) {
//       console.log('App wallet balance:\t' + Chalk.green(appBalance + ' Ether'))
//     } else {
//       console.log('App Balance:\t' + Chalk.red(appBalance + ' Ether'))
//     }
//   })

//   vaultContract.methods.getAuthorizedBank().call({from: gas.from}, (err, address) => {
//     console.log('Bank that is authorized to operate vault:\t\t' + Chalk.green(address))
//   })

//   console.log('Bank Address:\t\t' + Chalk.green(bankContractAddress))
//   console.log('Vault Address:\t\t' + Chalk.green(vaultContractAddress))
//   console.log('App Wallet address:\t' + Chalk.green(appWallet))

// } catch (e) {
//   console.log(Chalk.red('Error while initializing client service Ethereum connection: '))
//   console.log(Chalk.red(e))
// }


exports.test = function() {

  return new Promise((resolve, reject) => {
    resolve('get successful!')
  })

}
