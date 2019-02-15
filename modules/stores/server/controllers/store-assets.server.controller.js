'use strict';

/**
 * Module dependencies.
 */
const path = require('path')
const mongoose = require('mongoose')
const Store = mongoose.model('Store')
const StoreAsset = mongoose.model('StoreAsset')

const errorHandler = require(path.resolve('./modules/core/server/controllers/errors.server.controller'))
const _ = require('lodash')


/**
 * Create a Store
 */
exports.create = function(req, res) {

  let storeAsset = new StoreAsset(req.body)
  storeAsset.save(function(err) {
    if (err) {
      return res.status(400).send({
        message: errorHandler.getErrorMessage(err)
      });
    } else {
      res.jsonp(storeAsset);
    }
  });
};

/**
 * Show the current Store
 */
exports.read = function(req, res) {
  // convert mongoose document to JSON
  let storeAsset = req.storeAsset ? req.storeAsset.toJSON() : {};

  res.jsonp(storeAsset);
}

/**
 * Update a Store
 */
exports.update = function(req, res) {
  var storeAsset = req.storeAsset;

  storeAsset = _.extend(storeAsset, req.body);

  storeAsset.save(function(err) {
    if (err) {
      return res.status(400).send({
        message: errorHandler.getErrorMessage(err)
      });
    } else {
      res.jsonp(storeAsset)
    }
  });
};

/**
 * Delete an Store
 */
exports.delete = function(req, res) {
  var storeAsset = req.storeAsset;

  storeAsset.remove(function(err) {
    if (err) {
      return res.status(400).send({
        message: errorHandler.getErrorMessage(err)
      });
    } else {
      res.jsonp(storeAsset);
    }
  });
};

/**
 * List of Stores
 */
exports.list = function(req, res) {
  
  console.log(req.query)
  
  let q = req.query

  StoreAsset.find(q).sort('-created').populate('affiliate', 'displayName').exec(function(err, storeAssets) {
    if (err) {
      return res.status(400).send({
        message: errorHandler.getErrorMessage(err)
      })
    } else {
      res.jsonp(storeAssets);
    }
  })
}

/**
 * Store middleware
 */
exports.storeAssetByID = function(req, res, next, id) {

  if (!mongoose.Types.ObjectId.isValid(id)) {
    return res.status(400).send({
      message: 'Store is invalid'
    });
  }

  StoreAsset.findById(id).populate('asset').exec(function (err, storeAsset) {
    if (err) {
      return next(err);
    } else if (!storeAsset) {
      return res.status(404).send({
        message: 'No Store with that identifier has been found'
      });
    }
    req.storeAsset = storeAsset;
    next();
  });
};
