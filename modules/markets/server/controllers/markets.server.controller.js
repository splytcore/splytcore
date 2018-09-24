'use strict';

/**
 * Module dependencies.
 */
var path = require('path'),
  mongoose = require('mongoose'),
  Market = mongoose.model('Market'),
  errorHandler = require(path.resolve('./modules/core/server/controllers/errors.server.controller')),
  _ = require('lodash');

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

  res.jsonp(market);
};

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
  Market.find().sort('-created').populate('user', 'displayName').exec(function(err, markets) {
    if (err) {
      return res.status(400).send({
        message: errorHandler.getErrorMessage(err)
      });
    } else {
      res.jsonp(markets);
    }
  });
};

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
