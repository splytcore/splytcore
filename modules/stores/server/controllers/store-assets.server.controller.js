'use strict';

/**
 * Module dependencies.
 */
const path = require('path')
const mongoose = require('mongoose')
const Store = mongoose.model('Store')
const Hashtag = mongoose.model('Hashtag')
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

  // Delete hashtag before deleting store asset
  Hashtag.findOne({asset: storeAsset.asset, affiliate: req.user._id}).remove().exec( (err, result) => {
    if(err) {
      return res.status(400).send({
        message: errorHandler.getErrorMessage(err)
      })
      storeAsset.remove(function(err) {
        if (err) {
          return res.status(400).send({
            message: errorHandler.getErrorMessage(err)
          });
        } else {
          res.jsonp(storeAsset);
        }
      });
    }
  }
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

  StoreAsset.findById(id).populate('asset').populate('store').exec(function (err, storeAsset) {
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
