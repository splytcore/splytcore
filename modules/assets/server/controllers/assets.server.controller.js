'use strict';

/**
 * Module dependencies.
 */
var path = require('path'),
  mongoose = require('mongoose'),
  Asset = mongoose.model('Asset'),
  errorHandler = require(path.resolve('./modules/core/server/controllers/errors.server.controller')),
  EthService = require(path.resolve('./modules/eth/server/services/eth.server.service')),
  _ = require('lodash');

/**
 * Create a asset
 */
exports.create = function(req, res) {

  let asset = new Asset(req.body);
  console.log('assetId: ' + asset._id)
  EthService.createAsset(asset)
  //   .then((result) => {
  //     console.log('create asset contract result..' + result)            
  //   })
  //   .catch((err) => {
  //     console.log(err)
  //   }
  // )

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

  // convert mongoose document to JSON
  var asset = req.asset ? req.asset.toJSON() : {};
  asset.isCurrentUserOwner = req.user && asset.user && asset.user._id.toString() === req.user._id.toString() 

  EthService.getAssetInfoByAssetId(asset._id)
    .then((fields) => {
      console.log('successful get asset info')
      console.log(fields)

      asset.address = fields[0]

      asset.status = fields[2]
      
      asset.term = fields[3]
      asset.inventoryCount = fields[4]
      asset.seller = fields[5]      
      asset.totalCost = fields[6]

      console.log(asset)
      
      res.jsonp(asset)  
    })
    .catch((err) => {
      res.jsonp(err)  
    })

}

/**
 * Update a asset
 */
exports.update = function(req, res) {
  var asset = req.asset;
  asset = _.extend(asset, req.body);

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
 * Delete an asset
 */
exports.delete = function(req, res) {
  var asset = req.asset;

  asset.remove(function(err) {
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
