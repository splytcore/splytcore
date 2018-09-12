'use strict';

/**
 * Module dependencies.
 */
var path = require('path'),
  mongoose = require('mongoose'),
  async = require('async'),
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
    .then((result) => {
      console.log('create asset contract result..' + result)    

      asset.user = req.user;
      asset.save(function(err) {
        if (err) {
          return res.status(400).send({
            message: errorHandler.getErrorMessage(err)
          });
        } else {
          res.jsonp(asset);
        }
      })
    })
    .catch((err) => {
      return res.status(400).send({
        message: 'error creating asset'
      })
    }
  )


};

/**
 * Show the current asset
 */
exports.read = function(req, res) {

  // convert mongoose document to JSON
  var tempAsset = req.asset ? req.asset.toJSON() : {};
  let assetId = tempAsset._id
  // asset.isCurrentUserOwner = req.user && asset.user && asset.user._id.toString() === req.user._id.toString() 

  EthService.getAssetInfoByAssetId(assetId)
    .then((fields) => {
      console.log('successful get asset info')
      console.log(fields)
      let asset = {
          title: tempAsset.title, //this is from db
          description: tempAsset.description, //this is from db
          address : fields[0],
          _id: fields[1].substr(2),
          status : fields[2],
          term: fields[3],
          inventoryCount: fields[4],
          seller: fields[5],
          totalCost: fields[6]
      }
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

  let assets = []
  EthService.getAssetsLength()
  .then((length) => {
    console.log('number of assets listed' + length)
    async.times(parseInt(length), (index, callback) => {    
      console.log('index:' + index)
      EthService.getAssetInfoByIndex(index)
      .then((fields) => {
        console.log(fields)
        // return (address(asset), asset.assetId(), asset.status(), asset.term(), asset.inventoryCount(), asset.seller(), asset.totalCost());


        assets.push({
          assetAddress: fields[0],
          _id: fields[1].substr(2),
          status: fields[2],
          term: fields[3],
          inventoryCount: fields[4],
          seller: fields[5],
          totalCost: fields[6]
          })
        callback()
      })
      .catch((err) => {
        console.log(err)
        callback(err)
      })  
    }, (err) => {
      if (err) {
        return res.status(400).send({
          message: errorHandler.getErrorMessage(err)
        });
      } else {
        res.jsonp(assets);
      }      
    })
  })
  .catch((err) => {
    res.jsonp(err)
  })

  // Asset.find().sort('-created').populate('user', 'displayName').exec(function(err, assets) {
  //   if (err) {
  //     return res.status(400).send({
  //       message: errorHandler.getErrorMessage(err)
  //     });
  //   } else {
  //     res.jsonp(assets);
  //   }
  // });
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
