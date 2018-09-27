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

  res.jsonp({ splytManagerABI: splytManagerABI, 
  			  assetManagerABI: assetManagerABI,
  			  orderManagerABI: orderManagerABI,
  			  arbitrationManagerABI: arbitrationManagerABI,
          reputationManagerABI: reputationManagerABI,          
  			  splytManagerAddress: splytManagerAddress })
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
  let user = req.user
  EthService.unlockAccount(user.publicKey, user.walletPassword)
    .then(() => {
      console.log('successful unlocking of account')
      next()       
    })
    .catch((err) => {
      return res.status(400).send({
        message: err.toString()
      })      
    })
}


exports.addMarketPlace = function(req, res) {
  console.log(req.body)
  let marketPlace = req.body.marketPlace
  let assetId = req.body.assetId
  let wallet = req.body.wallet

  EthService.addMarketPlace(assetId, marketPlace, wallet)
    .on('transactionHash', (hash) => {
      console.log('trxHash: ' + hash)
      res.jsonp(hash)
    }) 
    .on('error', (err) => {
      return res.status(400).send({
        message: 'error adding marketplace to asset'
      })
    }
  )
 
}