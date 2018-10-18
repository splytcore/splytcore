'use strict';

/**
 * Module dependencies.
 */
const path = require('path')
const mongoose = require('mongoose')
const Market = mongoose.model('Market')
const async = require('async')
const errorHandler = require(path.resolve('./modules/core/server/controllers/errors.server.controller'))
const  _ = require('lodash')
const EthService = require(path.resolve('./modules/eth/server/services/eth.server.service'))
/**
 * Create a Market
 */
exports.create = function(req, res) {
  var market = new Market(req.body);
  market.user = req.user;

  market.save(function(err) {
    if (err) {
      return res.status(400).send({
        message: errorHandler.getErrorMessage(err)
      });
    } else {
      res.jsonp(market);
    }
  });
};

/**
 * Show the current Market
 */
exports.read = function(req, res) {
  // convert mongoose document to JSON
  var market = req.market ? req.market.toJSON() : {};

  // Add a custom field to the Article, for determining if the current User is the "owner".
  // NOTE: This field is NOT persisted to the database, since it doesn't exist in the Article model.
  market.isCurrentUserOwner = req.user && market.user && market.user._id.toString() === req.user._id.toString();

  EthService.getTokenBalance(market.wallet)
    .then((tokenBalance) => {
      market.tokenBalance = tokenBalance
      res.jsonp(market);
    })
    .catch((err) => {
      return res.status(400).send({ message: err.toString() })
    })
}

/**
 * Update a Market
 */
exports.update = function(req, res) {
  var market = req.market;

  market = _.extend(market, req.body);

  market.save(function(err) {
    if (err) {
      return res.status(400).send({
        message: errorHandler.getErrorMessage(err)
      });
    } else {
      res.jsonp(market);
    }
  });
};

/**
 * Delete an Market
 */
exports.delete = function(req, res) {
  var market = req.market;

  market.remove(function(err) {
    if (err) {
      return res.status(400).send({
        message: errorHandler.getErrorMessage(err)
      });
    } else {
      res.jsonp(market);
    }
  });
};

/**
 * List of Markets
 */
exports.list = function(req, res) {
 
  async.waterfall([
    function getMarkets (next) {             
      Market.find().sort('-created').populate('user', 'displayName').exec(function(err, markets) {
        next(err, markets)
      })
    },    
    function bindTokenBalance(markets, next) {
      async.each(markets, (market, callback) => {  
        if (market.wallet) {
          EthService.getTokenBalance(market.wallet)
            .then((tokenBalance) => {
              market.tokenBalance = tokenBalance
              console.log('token balance: ' + tokenBalance)
              callback()
            })
            .catch((err) => {
              console.log(err) //no need to exit loop
              callback()
            })
        } else {
          callback()
        }
      }, (err) => {
        next(err, markets)     
      })
    }    
  ], (err, markets) => {
    if (err) {      
      return res.status(400).send({ message: errorHandler.getErrorMessage(err) })
    }      
    res.jsonp(markets)  
  })  


}

/**
 * Market middleware
 */
exports.marketByID = function(req, res, next, id) {

  if (!mongoose.Types.ObjectId.isValid(id)) {
    return res.status(400).send({
      message: 'Market is invalid'
    });
  }

  Market.findById(id).populate('user', 'displayName').exec(function (err, market) {
    if (err) {
      return next(err);
    } else if (!market) {
      return res.status(404).send({
        message: 'No Market with that identifier has been found'
      });
    }
    req.market = market;
    next();
  });
};
