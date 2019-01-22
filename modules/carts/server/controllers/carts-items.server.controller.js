'use strict';

/**
 * Module dependencies.
 */
var path = require('path'),
  mongoose = require('mongoose'),
  CartItem = mongoose.model('CartItem'),
  errorHandler = require(path.resolve('./modules/core/server/controllers/errors.server.controller')),
  _ = require('lodash');

/**
 * Create a Item
 */
exports.create = function(req, res) {
  var cartItem = new CartItem(req.body);

  cartItem.save(function(err) {
    if (err) {
      return res.status(400).send({
        message: errorHandler.getErrorMessage(err)
      });
    } else {
      res.jsonp(cartItem);
    }
  })
}

/**
 * Show the current cartItem
 */
exports.read = function(req, res) {
  // convert mongoose document to JSON
  var cartItem = req.cartItemItem ? req.cartItem.toJSON() : {};

  // Add a custom field to the Article, for determining if the current User is the "owner".
  // NOTE: This field is NOT persisted to the database, since it doesn't exist in the Article model.
  // cartItem.isCurrentUserOwner = req.user && cartItem.user && cartItem.user._id.toString() === req.user._id.toString();

  res.jsonp(cartItem);
};

/**
 * Update a cartItem
 */
exports.update = function(req, res) {
  var cartItem = req.cartItem;

  cartItem = _.extend(cartItem, req.body);

  cartItem.save(function(err) {
    if (err) {
      return res.status(400).send({
        message: errorHandler.getErrorMessage(err)
      });
    } else {
      res.jsonp(cartItem);
    }
  });
};

/**
 * Delete an cartItem
 */
exports.delete = function(req, res) {
  var cartItem = req.cartItem;

  cartItem.remove(function(err) {
    if (err) {
      return res.status(400).send({
        message: errorHandler.getErrorMessage(err)
      });
    } else {
      res.jsonp(cartItem);
    }
  });
};

/**
 * List of cartItems
 */
exports.list = function(req, res) {
  CartItem.find().sort('-created').populate('user', 'displayName').exec(function(err, cartItems) {
    if (err) {
      return res.status(400).send({
        message: errorHandler.getErrorMessage(err)
      });
    } else {
      res.jsonp(cartItems);
    }
  });
};

/**
 * cartItem middleware
 */
exports.cartItemByID = function(req, res, next, id) {

  if (!mongoose.Types.ObjectId.isValid(id)) {
    return res.status(400).send({
      message: 'cartItem is invalid'
    });
  }

  CartItem.findById(id).populate('user', 'displayName').exec(function (err, cartItem) {
    if (err) {
      return next(err);
    } else if (!cartItem) {
      return res.status(404).send({
        message: 'No cartItem with that identifier has been found'
      });
    }
    req.cartItem = cartItem;
    next();
  });
};
