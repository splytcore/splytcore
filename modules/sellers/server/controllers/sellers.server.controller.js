'use strict';

/**
 * Module dependencies.
 */
var path = require('path'),
  mongoose = require('mongoose'),
  Seller = mongoose.model('Seller'),
  errorHandler = require(path.resolve('./modules/core/server/controllers/errors.server.controller')),
  _ = require('lodash');

/**
 * Create a Seller
 */
exports.create = function(req, res) {
  var seller = new Seller(req.body);
  seller.user = req.user;

  seller.save(function(err) {
    if (err) {
      return res.status(400).send({
        message: errorHandler.getErrorMessage(err)
      });
    } else {
      res.jsonp(seller);
    }
  });
};

/**
 * Show the current Seller
 */
exports.read = function(req, res) {
  // convert mongoose document to JSON
  var seller = req.seller ? req.seller.toJSON() : {};

  // Add a custom field to the Article, for determining if the current User is the "owner".
  // NOTE: This field is NOT persisted to the database, since it doesn't exist in the Article model.
  seller.isCurrentUserOwner = req.user && seller.user && seller.user._id.toString() === req.user._id.toString();

  res.jsonp(seller);
};

/**
 * Update a Seller
 */
exports.update = function(req, res) {
  var seller = req.seller;

  seller = _.extend(seller, req.body);

  seller.save(function(err) {
    if (err) {
      return res.status(400).send({
        message: errorHandler.getErrorMessage(err)
      });
    } else {
      res.jsonp(seller);
    }
  });
};

/**
 * Delete an Seller
 */
exports.delete = function(req, res) {
  var seller = req.seller;

  seller.remove(function(err) {
    if (err) {
      return res.status(400).send({
        message: errorHandler.getErrorMessage(err)
      });
    } else {
      res.jsonp(seller);
    }
  });
};

/**
 * List of Sellers
 */
exports.list = function(req, res) {
  Seller.find().sort('-created').populate('user', 'displayName').exec(function(err, sellers) {
    if (err) {
      return res.status(400).send({
        message: errorHandler.getErrorMessage(err)
      });
    } else {
      res.jsonp(sellers);
    }
  });
};

/**
 * Seller middleware
 */
exports.sellerByID = function(req, res, next, id) {

  if (!mongoose.Types.ObjectId.isValid(id)) {
    return res.status(400).send({
      message: 'Seller is invalid'
    });
  }

  Seller.findById(id).populate('user', 'displayName').exec(function (err, seller) {
    if (err) {
      return next(err);
    } else if (!seller) {
      return res.status(404).send({
        message: 'No Seller with that identifier has been found'
      });
    }
    req.seller = seller;
    next();
  });
};
