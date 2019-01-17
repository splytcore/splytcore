'use strict';

/**
 * Module dependencies.
 */
var path = require('path'),
  mongoose = require('mongoose'),
  Store = mongoose.model('Store'),
  errorHandler = require(path.resolve('./modules/core/server/controllers/errors.server.controller')),
  _ = require('lodash');

/**
 * Create a Store
 */
exports.create = function(req, res) {
  let store = new Store(req.body);
  store.affiliate = req.user;

  store.save(function(err) {
    if (err) {
      return res.status(400).send({
        message: errorHandler.getErrorMessage(err)
      });
    } else {
      res.jsonp(store);
    }
  });
};

/**
 * Show the current Store
 */
exports.read = function(req, res) {
  // convert mongoose document to JSON
  let store = req.store ? req.store.toJSON() : {};

  res.jsonp(store);
}

/**
 * Update a Store
 */
exports.update = function(req, res) {
  var store = req.store;

  store = _.extend(store, req.body);

  store.save(function(err) {
    if (err) {
      return res.status(400).send({
        message: errorHandler.getErrorMessage(err)
      });
    } else {
      res.jsonp(store);
    }
  });
};

/**
 * Delete an Store
 */
exports.delete = function(req, res) {
  var store = req.store;

  store.remove(function(err) {
    if (err) {
      return res.status(400).send({
        message: errorHandler.getErrorMessage(err)
      });
    } else {
      res.jsonp(store);
    }
  });
};

/**
 * List of Stores
 */
exports.list = function(req, res) {
  Store.find().sort('-created').populate('affiliate', 'displayName').exec(function(err, stores) {
    if (err) {
      return res.status(400).send({
        message: errorHandler.getErrorMessage(err)
      });
    } else {
      res.jsonp(stores);
    }
  });
}

/**
 * Store middleware
 */
exports.storeByID = function(req, res, next, id) {

  if (!mongoose.Types.ObjectId.isValid(id)) {
    return res.status(400).send({
      message: 'Store is invalid'
    });
  }

  Store.findById(id).populate('affiliate', 'displayName').populate('categories').exec(function (err, store) {
    if (err) {
      return next(err);
    } else if (!store) {
      return res.status(404).send({
        message: 'No Store with that identifier has been found'
      });
    }
    req.store = store;
    next();
  });
};
