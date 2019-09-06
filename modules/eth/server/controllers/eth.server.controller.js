'use strict';

/**
 * Module dependencies.
 */
var path = require('path'),
  mongoose = require('mongoose'),
  config = require(path.resolve('./config/config')),
  errorHandler = require(path.resolve('./modules/core/server/controllers/errors.server.controller')),
  EthService = require(path.resolve('./modules/eth/server/services/eth.server.service')),
  _ = require('lodash');

exports.getAll = function(req, res) {
  
  let splytManagerABI = EthService.getSplytManagerABI()
  let assetManagerABI = EthService.getAssetManagerABI()
  let orderManagerABI = EthService.getOrderManagerABI()
  let arbitrationManagerABI = EthService.getArbitrationManagerABI()
  let reputationManagerABI = EthService.getReputationManagerABI()
  
  let splytManagerAddress = config.ethereum.splytManagerAddress

  res.jsonp({ 
          splytManagerABI: splytManagerABI, 
  			  assetManagerABI: assetManagerABI,
  			  orderManagerABI: orderManagerABI,
  			  arbitrationManagerABI: arbitrationManagerABI,
          reputationManagerABI: reputationManagerABI,          
  			  splytManagerAddress: splytManagerAddress
          })
}

exports.getDefaultWallets = function(req, res) {

  let wallets = EthService.getDefaultWallets()
  console.log(wallets)
  res.jsonp(wallets)
 
}

exports.getSplytServiceInfo = function(req, res) {

  res.jsonp(EthService.getSplytServiceInfo())
 
}

exports.unlockAccount = function(req, res, next) {

  console.log('environment')
  console.log(process.env.NODE_ENV)
  console.log(config.env)

  //no need to unlock if using local test rpc
  // if (config.env) {
  //   return next()
  // }

  let user = req.fullUser
  console.log('user wallet addr: ', user.publicKey)
  console.log('user wallet pass: ', user.walletPassword)
  EthService.unlockAccount(user.publicKey, user.walletPassword)
    .then(() => {
      console.log('successful unlocking of account')
      next()       
    })
    .catch((err) => {
      console.log()
      return res.status(400).send({
        message: err.toString()
      })      
    })
}

//give tokens
exports.initUser = function(req, res) {

  let user = req.user
  EthService.initUser(user.publicKey, user.walletPassword)
    .on('transactionHash', (hash) => {
      console.log('trx for giving tokens: ' + hash)
      res.jsonp(hash)
    }) 
    .on('error', (err) => {
      console.log('error giving tokens')
      console.log(err)
      // res.jsonp(err.toString())
    }
  )  


}


exports.addMarketPlace = function(req, res) {
  console.log(req.body)
  let marketPlace = req.body.marketPlace
  let assetId = req.body.assetId
  let wallet = req.user.publicKey

  EthService.addMarketPlace(assetId, marketPlace, wallet)
    .on('transactionHash', (hash) => {
      console.log('trxHash: ' + hash)
      res.jsonp(hash)
    }) 
    .on('error', (err) => {
      console.log('add market place error')
      console.log(err)
    }
  )
 
}

exports.createNewAccount = function(req, res) {
  
  console.log(req.body)
  let walletPassword = req.body.walletPassword
  console.log(walletPassword)
  let user = req.user
  user.walletPassword = walletPassword

  EthService.createAccount2(walletPassword)
    .then((wallet) => {
      console.log('account')
      console.log(wallet)
      user.publicKey = wallet
      user.save((err) => {
        res.jsonp({ publicKey: wallet })
      })
    })  
    .catch((err) => {
      res.status(400).send(err)
    }
  )

}


exports.isAccountExist = function(req, res) {

  let account = req.query.account
  console.log('checking if account exist: ' + account)
  
  EthService.isAccountExist(account)
    .then((result) => {
      res.jsonp(result)
    })  
    .catch((err) => {
      res.status(400).send(err)
    }
  )
 
}


exports.addAccountByPrivateKey = function(req, res) {

  let privateKey = req.query.privateKey
  let password = req.query.password

  console.log(privateKey)
  console.log(password)

  EthService.addAccountByPrivateKey(privateKey, password)
    .then((result)  => {
      res.jsonp(result)
    }) 
    .catch((err) => {
      res.jsonp(err)
    }
  )
 
}