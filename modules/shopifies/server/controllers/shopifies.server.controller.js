'use strict';

/**
 * Module dependencies.
 */
var path = require('path'),
  mongoose = require('mongoose'),
  Shopify = mongoose.model('Shopify'),
  errorHandler = require(path.resolve('./modules/core/server/controllers/errors.server.controller')),
  _ = require('lodash');

/**
 * Create a Shopify
 */
exports.create = function(req, res) {
  var shopify = new Shopify(req.body);
  shopify.user = req.user;

  shopify.save(function(err) {
    if (err) {
      return res.status(400).send({
        message: errorHandler.getErrorMessage(err)
      });
    } else {
      res.jsonp(shopify);
    }
  });
};

/**
 * Show the current Shopify
 */
exports.read = function(req, res) {
  // convert mongoose document to JSON
  var shopify = req.shopify ? req.shopify.toJSON() : {};

  // Add a custom field to the Article, for determining if the current User is the "owner".
  // NOTE: This field is NOT persisted to the database, since it doesn't exist in the Article model.
  shopify.isCurrentUserOwner = req.user && shopify.user && shopify.user._id.toString() === req.user._id.toString();

  res.jsonp(shopify);
};

/**
 * Update a Shopify
 */
exports.update = function(req, res) {
  var shopify = req.shopify;

  shopify = _.extend(shopify, req.body);

  shopify.save(function(err) {
    if (err) {
      return res.status(400).send({
        message: errorHandler.getErrorMessage(err)
      });
    } else {
      res.jsonp(shopify);
    }
  });
};

/**
 * Delete an Shopify
 */
exports.delete = function(req, res) {
  var shopify = req.shopify;

  shopify.remove(function(err) {
    if (err) {
      return res.status(400).send({
        message: errorHandler.getErrorMessage(err)
      });
    } else {
      res.jsonp(shopify);
    }
  });
};

/**
 * List of Shopifies
 */
exports.list = function(req, res) {
  Shopify.find().sort('-created').populate('user', 'displayName').exec(function(err, shopifies) {
    if (err) {
      return res.status(400).send({
        message: errorHandler.getErrorMessage(err)
      });
    } else {
      res.jsonp(shopifies);
    }
  });
};

/**
 * Shopify middleware
 */
exports.shopifyByID = function(req, res, next, id) {

  if (!mongoose.Types.ObjectId.isValid(id)) {
    return res.status(400).send({
      message: 'Shopify is invalid'
    });
  }

  Shopify.findById(id).populate('user', 'displayName').exec(function (err, shopify) {
    if (err) {
      return next(err);
    } else if (!shopify) {
      return res.status(404).send({
        message: 'No Shopify with that identifier has been found'
      });
    }
    req.shopify = shopify;
    next();
  });
};
