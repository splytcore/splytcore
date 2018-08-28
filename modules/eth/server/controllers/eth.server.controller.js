'use strict';

/**
 * Module dependencies.
 */
var path = require('path'),
  mongoose = require('mongoose'),
  errorHandler = require(path.resolve('./modules/core/server/controllers/errors.server.controller')),
  EthService = require(path.resolve('./modules/eth/server/services/eth.server.service')),
  _ = require('lodash');

exports.getAll = function(req, res) {
  let splytManagerABI = EthService.getSplytManagerABI();
  let assetManagerABI = EthService.getAssetManagerABI();
  let orderManagerABI = EthService.getOrderManagerABI();
  let arbitrationManagerABI = EthService.getArbitrationManagerABI();

  res.jsonp({ splytManagerABI: splytManagerABI, 
  			  assetManagerABI: assetManagerABI,
  			  orderManagerABI: orderManagerABI,
  			  arbitrationManagerABI: arbitrationManagerABI,
  			  splytManagerAddress: '0xc17d8673c0719bea85e05017e70405b659401cb9' });
};



