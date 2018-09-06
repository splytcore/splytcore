'use strict';

/**
 * Module dependencies.
 */
var path = require('path'),
  mongoose = require('mongoose'),
  Arbitration = mongoose.model('Arbitration'),
  errorHandler = require(path.resolve('./modules/core/server/controllers/errors.server.controller')),
  _ = require('lodash');

/**
 * Create a Arbitration
 */
exports.create = function(req, res) {
  var arbitration = new Arbitration(req.body);
  arbitration.user = req.user;

  arbitration.save(function(err) {
    if (err) {
      return res.status(400).send({
        message: errorHandler.getErrorMessage(err)
      });
    } else {
      res.jsonp(arbitration);
    }
  });
};

/**
 * Show the current Arbitration
 */
exports.read = function(req, res) {
  // convert mongoose document to JSON
  var arbitration = req.arbitration ? req.arbitration.toJSON() : {};

  // Add a custom field to the Article, for determining if the current User is the "owner".
  // NOTE: This field is NOT persisted to the database, since it doesn't exist in the Article model.
  arbitration.isCurrentUserOwner = req.user && arbitration.user && arbitration.user._id.toString() === req.user._id.toString();

  res.jsonp(arbitration);
};

/**
 * Update a Arbitration
 */
exports.update = function(req, res) {
  var arbitration = req.arbitration;

  arbitration = _.extend(arbitration, req.body);

  arbitration.save(function(err) {
    if (err) {
      return res.status(400).send({
        message: errorHandler.getErrorMessage(err)
      });
    } else {
      res.jsonp(arbitration);
    }
  });
};

/**
 * Delete an Arbitration
 */
exports.delete = function(req, res) {
  var arbitration = req.arbitration;

  arbitration.remove(function(err) {
    if (err) {
      return res.status(400).send({
        message: errorHandler.getErrorMessage(err)
      });
    } else {
      res.jsonp(arbitration);
    }
  });
};

/**
 * List of Arbitrations
 */
exports.list = function(req, res) {
  Arbitration.find().sort('-created').populate('user', 'displayName').exec(function(err, arbitrations) {
    if (err) {
      return res.status(400).send({
        message: errorHandler.getErrorMessage(err)
      });
    } else {
      res.jsonp(arbitrations);
    }
  });
};

/**
 * Arbitration middleware
 */
exports.arbitrationByID = function(req, res, next, id) {

  if (!mongoose.Types.ObjectId.isValid(id)) {
    return res.status(400).send({
      message: 'Arbitration is invalid'
    });
  }

  Arbitration.findById(id).populate('user', 'displayName').exec(function (err, arbitration) {
    if (err) {
      return next(err);
    } else if (!arbitration) {
      return res.status(404).send({
        message: 'No Arbitration with that identifier has been found'
      });
    }
    req.arbitration = arbitration;
    next();
  });
};
