'use strict';

/**
 * Module dependencies.
 */
var path = require('path'),
  mongoose = require('mongoose'),
  Asset = mongoose.model('Asset'),
  errorHandler = require(path.resolve('./modules/core/server/controllers/errors.server.controller')),
  web3 = require(path.resolve('./modules/eth/server/services/eth.server.service')),
  _ = require('lodash');

/**
 * Create a asset
 */
exports.create = function(req, res) {

  let asset = new Asset(req.body);

  // web3.createasset(asset._id)
  //   .then((result) => {
  //     console.log('create asset contract result..' + result)            
  //   })
  //   .catch((err) => {
  //     console.log(err)
  //   })

  
  asset.user = req.user;

  asset.save(function(err) {
    if (err) {
      return res.status(400).send({
        message: errorHandler.getErrorMessage(err)
      });
    } else {
      res.jsonp(asset);
    }
  });
};

/**
 * Show the current asset
 */
exports.read = function(req, res) {

  console.log('this bing called?')
  // convert mongoose document to JSON
  var asset = req.asset ? req.asset.toJSON() : {};
  asset.isCurrentUserOwner = req.user && asset.user && asset.user._id.toString() === req.user._id.toString() 
  res.jsonp(asset)  
  
  // web3.getassetInfo(asset._id.toString())
  //   .then((result) => {
      // console.log('asset amount' + result.ether)
      // console.log('asset address' + result.address)
      // console.log('promisor '  + result.promisor)
      // console.log('promisee '  + result.promisee)
      // console.log('stage '  + result.stage)
      // asset.address = result.address
      // asset.ether = result.ether
      // asset.promisor = result.promisor
      // asset.promisee = result.promisee
      // asset.stage = result.stage

    //   res.jsonp(asset)
    // })
    // .catch((err) => {
    //   console.log(err)
    //   res.jsonp(asset)
    // })

}

/**
 * Update a asset
 */
exports.update = function(req, res) {
  var asset = req.asset;
  asset = _.extend(asset, req.body);

  Asset.save(function(err) {
    if (err) {
      return res.status(400).send({
        message: errorHandler.getErrorMessage(err)
      });
    } else {
      res.jsonp(asset);
    }
  });
};

/**
 * Delete an asset
 */
exports.delete = function(req, res) {
  var asset = req.asset;

  Asset.remove(function(err) {
    if (err) {
      return res.status(400).send({
        message: errorHandler.getErrorMessage(err)
      });
    } else {
      res.jsonp(asset);
    }
  });
};

/**
 * List of assets
 */
exports.list = function(req, res) {

  // web3.getAssetsLength()
  // .then((result) => {
  //   console.log('Number of asset contracts...' + result)
  // })
  // .catch((err) => {
  //   console.log(err)
  // })

  Asset.find().sort('-created').populate('user', 'displayName').exec(function(err, assets) {
    if (err) {
      return res.status(400).send({
        message: errorHandler.getErrorMessage(err)
      });
    } else {
      res.jsonp(assets);
    }
  });
};

/**
 * asset middleware
 */
exports.assetByID = function(req, res, next, id) {

  if (!mongoose.Types.ObjectId.isValid(id)) {
    return res.status(400).send({
      message: 'asset is invalid'
    });
  }

  Asset.findById(id)
  .populate('user', 'displayName')
  .exec(function (err, asset) {

    if (err) {
      return next(err);
    } else if (!asset) {
      return res.status(404).send({
        message: 'No asset with that identifier has been found'
      });
    }
    req.asset = asset;
    next();
  });
};