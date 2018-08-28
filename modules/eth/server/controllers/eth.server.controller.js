'use strict';

/**
 * Module dependencies.
 */
var path = require('path'),
  mongoose = require('mongoose'),
  errorHandler = require(path.resolve('./modules/core/server/controllers/errors.server.controller')),
  EthService = require(path.resolve('./modules/eth/server/services/eth.server.service')),
  _ = require('lodash');

exports.getSplytManagerABI = function(req, res) {
  let abi = EthService.getSplytManagerABI();
  res.jsonp({ abi: abi, address: '0xc17d8673c0719bea85e05017e70405b659401cb9' });
};



