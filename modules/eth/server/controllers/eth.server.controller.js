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
  
  let splytManagerABI = EthService.getSplytManagerABI();
  let assetManagerABI = EthService.getAssetManagerABI();
  let orderManagerABI = EthService.getOrderManagerABI();
  let arbitrationManagerABI = EthService.getArbitrationManagerABI();
  let reputationManagerABI = EthService.getReputationManagerABI();
  
  let splytManagerAddress = config.ethereum.splytManagerAddress;

  res.jsonp({ splytManagerABI: splytManagerABI, 
  			  assetManagerABI: assetManagerABI,
  			  orderManagerABI: orderManagerABI,
  			  arbitrationManagerABI: arbitrationManagerABI,
          reputationManagerABI: reputationManagerABI,          
  			  splytManagerAddress: splytManagerAddress });
};



