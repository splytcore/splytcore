'use strict';

/**
 * Module dependencies.
 */
var path = require('path'),
  mongoose = require('mongoose'),
  Dashboard = mongoose.model('Dashboard'),
  errorHandler = require(path.resolve('./modules/core/server/controllers/errors.server.controller')),
  _ = require('lodash');

/**
 * Create a Dashboard
 */
exports.create = function(req, res) {
  var dashboard = new Dashboard(req.body);
  dashboard.user = req.user;

  dashboard.save(function(err) {
    if (err) {
      return res.status(400).send({
        message: errorHandler.getErrorMessage(err)
      });
    } else {
      res.jsonp(dashboard);
    }
  });
};

/**
 * Show the current Dashboard
 */
exports.read = function(req, res) {
  // convert mongoose document to JSON
  var dashboard = req.dashboard ? req.dashboard.toJSON() : {};

  // Add a custom field to the Article, for determining if the current User is the "owner".
  // NOTE: This field is NOT persisted to the database, since it doesn't exist in the Article model.
  dashboard.isCurrentUserOwner = req.user && dashboard.user && dashboard.user._id.toString() === req.user._id.toString();

  res.jsonp(dashboard);
};

/**
 * Update a Dashboard
 */
exports.update = function(req, res) {
  var dashboard = req.dashboard;

  dashboard = _.extend(dashboard, req.body);

  dashboard.save(function(err) {
    if (err) {
      return res.status(400).send({
        message: errorHandler.getErrorMessage(err)
      });
    } else {
      res.jsonp(dashboard);
    }
  });
};

/**
 * Delete an Dashboard
 */
exports.delete = function(req, res) {
  var dashboard = req.dashboard;

  dashboard.remove(function(err) {
    if (err) {
      return res.status(400).send({
        message: errorHandler.getErrorMessage(err)
      });
    } else {
      res.jsonp(dashboard);
    }
  });
};

/**
 * List of Dashboards
 */
exports.list = function(req, res) {
  Dashboard.find().sort('-created').populate('user', 'displayName').exec(function(err, dashboards) {
    if (err) {
      return res.status(400).send({
        message: errorHandler.getErrorMessage(err)
      });
    } else {
      res.jsonp(dashboards);
    }
  });
};

/**
 * Dashboard middleware
 */
exports.dashboardByID = function(req, res, next, id) {

  if (!mongoose.Types.ObjectId.isValid(id)) {
    return res.status(400).send({
      message: 'Dashboard is invalid'
    });
  }

  Dashboard.findById(id).populate('user', 'displayName').exec(function (err, dashboard) {
    if (err) {
      return next(err);
    } else if (!dashboard) {
      return res.status(404).send({
        message: 'No Dashboard with that identifier has been found'
      });
    }
    req.dashboard = dashboard;
    next();
  });
};
