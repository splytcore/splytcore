'use strict';

/**
 * Module dependencies.
 */
var path = require('path'),
  mongoose = require('mongoose'),
  Analytic = mongoose.model('Analytic'),
  errorHandler = require(path.resolve('./modules/core/server/controllers/errors.server.controller')),
  _ = require('lodash');

/**
 * Create a Analytic
 */
exports.create = function(req, res) {
  var analytic = new Analytic(req.body);
  analytic.user = req.user;

  analytic.save(function(err) {
    if (err) {
      return res.status(400).send({
        message: errorHandler.getErrorMessage(err)
      });
    } else {
      res.jsonp(analytic);
    }
  });
};

/**
 * Show the current Analytic
 */
exports.read = function(req, res) {
  // convert mongoose document to JSON
  var analytic = req.analytic ? req.analytic.toJSON() : {};

  // Add a custom field to the Article, for determining if the current User is the "owner".
  // NOTE: This field is NOT persisted to the database, since it doesn't exist in the Article model.
  analytic.isCurrentUserOwner = req.user && analytic.user && analytic.user._id.toString() === req.user._id.toString();

  res.jsonp(analytic);
};

/**
 * Update a Analytic
 */
exports.update = function(req, res) {
  var analytic = req.analytic;

  analytic = _.extend(analytic, req.body);

  analytic.save(function(err) {
    if (err) {
      return res.status(400).send({
        message: errorHandler.getErrorMessage(err)
      });
    } else {
      res.jsonp(analytic);
    }
  });
};

/**
 * Delete an Analytic
 */
exports.delete = function(req, res) {
  var analytic = req.analytic;

  analytic.remove(function(err) {
    if (err) {
      return res.status(400).send({
        message: errorHandler.getErrorMessage(err)
      });
    } else {
      res.jsonp(analytic);
    }
  });
};

/**
 * List of Analytics
 */
exports.list = function(req, res) {
  Analytic.find().sort('-created').populate('user', 'displayName').exec(function(err, analytics) {
    if (err) {
      return res.status(400).send({
        message: errorHandler.getErrorMessage(err)
      });
    } else {
      res.jsonp(analytics);
    }
  });
};

/**
 * Analytic middleware
 */
exports.analyticByID = function(req, res, next, id) {

  if (!mongoose.Types.ObjectId.isValid(id)) {
    return res.status(400).send({
      message: 'Analytic is invalid'
    });
  }

  Analytic.findById(id).populate('user', 'displayName').exec(function (err, analytic) {
    if (err) {
      return next(err);
    } else if (!analytic) {
      return res.status(404).send({
        message: 'No Analytic with that identifier has been found'
      });
    }
    req.analytic = analytic;
    next();
  });
};
