'use strict';

/**
 * Module dependencies.
 */
var path = require('path'),
  mongoose = require('mongoose'),
  Reputation = mongoose.model('Reputation'),
  errorHandler = require(path.resolve('./modules/core/server/controllers/errors.server.controller')),
  _ = require('lodash');

/**
 * Create a Reputation
 */
exports.create = function(req, res) {
  var reputation = new Reputation(req.body);
  reputation.user = req.user;

  reputation.save(function(err) {
    if (err) {
      return res.status(400).send({
        message: errorHandler.getErrorMessage(err)
      });
    } else {
      res.jsonp(reputation);
    }
  });
};

/**
 * Show the current Reputation
 */
exports.read = function(req, res) {
  // convert mongoose document to JSON
  var reputation = req.reputation ? req.reputation.toJSON() : {};

  // Add a custom field to the Article, for determining if the current User is the "owner".
  // NOTE: This field is NOT persisted to the database, since it doesn't exist in the Article model.
  reputation.isCurrentUserOwner = req.user && reputation.user && reputation.user._id.toString() === req.user._id.toString();

  res.jsonp(reputation);
};

/**
 * Update a Reputation
 */
exports.update = function(req, res) {
  var reputation = req.reputation;

  reputation = _.extend(reputation, req.body);

  reputation.save(function(err) {
    if (err) {
      return res.status(400).send({
        message: errorHandler.getErrorMessage(err)
      });
    } else {
      res.jsonp(reputation);
    }
  });
};

/**
 * Delete an Reputation
 */
exports.delete = function(req, res) {
  var reputation = req.reputation;

  reputation.remove(function(err) {
    if (err) {
      return res.status(400).send({
        message: errorHandler.getErrorMessage(err)
      });
    } else {
      res.jsonp(reputation);
    }
  });
};

/**
 * List of Reputations
 */
exports.list = function(req, res) {
  Reputation.find().sort('-created').populate('user', 'displayName').exec(function(err, reputations) {
    if (err) {
      return res.status(400).send({
        message: errorHandler.getErrorMessage(err)
      });
    } else {
      res.jsonp(reputations);
    }
  });
};

/**
 * Reputation middleware
 */
exports.reputationByID = function(req, res, next, id) {

  if (!mongoose.Types.ObjectId.isValid(id)) {
    return res.status(400).send({
      message: 'Reputation is invalid'
    });
  }

  Reputation.findById(id).populate('user', 'displayName').exec(function (err, reputation) {
    if (err) {
      return next(err);
    } else if (!reputation) {
      return res.status(404).send({
        message: 'No Reputation with that identifier has been found'
      });
    }
    req.reputation = reputation;
    next();
  });
};
