'use strict';

/**
 * Module dependencies.
 */
var path = require('path'),
  mongoose = require('mongoose'),
  Affiliate = mongoose.model('Affiliate'),
  errorHandler = require(path.resolve('./modules/core/server/controllers/errors.server.controller')),
  _ = require('lodash');

/**
 * Create a Affiliate
 */
exports.create = function(req, res) {
  var affiliate = new Affiliate(req.body);
  affiliate.user = req.user;

  affiliate.save(function(err) {
    if (err) {
      return res.status(400).send({
        message: errorHandler.getErrorMessage(err)
      });
    } else {
      res.jsonp(affiliate);
    }
  });
};

/**
 * Show the current Affiliate
 */
exports.read = function(req, res) {
  // convert mongoose document to JSON
  var affiliate = req.affiliate ? req.affiliate.toJSON() : {};

  // Add a custom field to the Article, for determining if the current User is the "owner".
  // NOTE: This field is NOT persisted to the database, since it doesn't exist in the Article model.
  affiliate.isCurrentUserOwner = req.user && affiliate.user && affiliate.user._id.toString() === req.user._id.toString();

  res.jsonp(affiliate);
};

/**
 * Update a Affiliate
 */
exports.update = function(req, res) {
  var affiliate = req.affiliate;

  affiliate = _.extend(affiliate, req.body);

  affiliate.save(function(err) {
    if (err) {
      return res.status(400).send({
        message: errorHandler.getErrorMessage(err)
      });
    } else {
      res.jsonp(affiliate);
    }
  });
};

/**
 * Delete an Affiliate
 */
exports.delete = function(req, res) {
  var affiliate = req.affiliate;

  affiliate.remove(function(err) {
    if (err) {
      return res.status(400).send({
        message: errorHandler.getErrorMessage(err)
      });
    } else {
      res.jsonp(affiliate);
    }
  });
};

/**
 * List of Affiliates
 */
exports.list = function(req, res) {
  Affiliate.find().sort('-created').populate('user', 'displayName').exec(function(err, affiliates) {
    if (err) {
      return res.status(400).send({
        message: errorHandler.getErrorMessage(err)
      });
    } else {
      res.jsonp(affiliates);
    }
  });
};

/**
 * Affiliate middleware
 */
exports.affiliateByID = function(req, res, next, id) {

  if (!mongoose.Types.ObjectId.isValid(id)) {
    return res.status(400).send({
      message: 'Affiliate is invalid'
    });
  }

  Affiliate.findById(id).populate('user', 'displayName').exec(function (err, affiliate) {
    if (err) {
      return next(err);
    } else if (!affiliate) {
      return res.status(404).send({
        message: 'No Affiliate with that identifier has been found'
      });
    }
    req.affiliate = affiliate;
    next();
  });
};
