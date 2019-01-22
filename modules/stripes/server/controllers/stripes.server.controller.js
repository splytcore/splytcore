'use strict';

/**
 * Module dependencies.
 */
var path = require('path'),
  mongoose = require('mongoose'),
  Stripe = mongoose.model('Stripe'),
  errorHandler = require(path.resolve('./modules/core/server/controllers/errors.server.controller')),
  _ = require('lodash'),
  stripe = require('stripe')('pk_test_tZPTIhuELHzFYOV3STXQ34dv');

/**
 * Create a Stripe
 */
exports.create = function(req, res) {
  var stripe = new Stripe(req.body);
  stripe.user = req.user;

  stripe.save(function(err) {
    if (err) {
      return res.status(400).send({
        message: errorHandler.getErrorMessage(err)
      });
    } else {
      res.jsonp(stripe);
    }
  });
};

/**
 * Show the current Stripe
 */
exports.read = function(req, res) {
  // convert mongoose document to JSON
  var stripe = req.stripe ? req.stripe.toJSON() : {};

  // Add a custom field to the Article, for determining if the current User is the "owner".
  // NOTE: This field is NOT persisted to the database, since it doesn't exist in the Article model.
  stripe.isCurrentUserOwner = req.user && stripe.user && stripe.user._id.toString() === req.user._id.toString();

  res.jsonp(stripe);
};

/**
 * Update a Stripe
 */
exports.update = function(req, res) {
  var stripe = req.stripe;

  stripe = _.extend(stripe, req.body);

  stripe.save(function(err) {
    if (err) {
      return res.status(400).send({
        message: errorHandler.getErrorMessage(err)
      });
    } else {
      res.jsonp(stripe);
    }
  });
};

/**
 * Delete an Stripe
 */
exports.delete = function(req, res) {
  var stripe = req.stripe;

  stripe.remove(function(err) {
    if (err) {
      return res.status(400).send({
        message: errorHandler.getErrorMessage(err)
      });
    } else {
      res.jsonp(stripe);
    }
  });
};

/**
 * List of Stripes
 */
exports.list = function(req, res) {
  Stripe.find().sort('-created').populate('user', 'displayName').exec(function(err, stripes) {
    if (err) {
      return res.status(400).send({
        message: errorHandler.getErrorMessage(err)
      });
    } else {
      res.jsonp(stripes);
    }
  });
};

/**
 * Stripe middleware
 */
exports.stripeByID = function(req, res, next, id) {

  if (!mongoose.Types.ObjectId.isValid(id)) {
    return res.status(400).send({
      message: 'Stripe is invalid'
    });
  }

  Stripe.findById(id).populate('user', 'displayName').exec(function (err, stripe) {
    if (err) {
      return next(err);
    } else if (!stripe) {
      return res.status(404).send({
        message: 'No Stripe with that identifier has been found'
      });
    }
    req.stripe = stripe;
    next();
  });
};
