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

  let asset = new Asset(req.body)
  console.log('assetId: ' + asset._id)
  EthService.createAsset(asset)
    .on('transactionHash', function(hash){
      console.log('transactionHash: ' + hash)
      asset.transactionHash = hash
      asset.user = req.user
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
    .on('confirmation', function(confirmationNumber, receipt){
        console.log('confirmation: ' + confirmationNumber)
        console.log('receipt: ' + receipt)
    })
    .on('receipt', function(receipt) {
      console.log('only receipt: ')
      console.log(receipt)
    })
    .on('error', function (err) {
      console.log('error creating asset contract')
      return res.status(400).send({
        message: 'error creating asset'
      })
    }
  )


}


/**
 * Show the current asset
 */
exports.read = function(req, res, next) {

  console.log('gettign asset detail')
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
          type : fields[3],          
          term: fields[4],
          inventoryCount: fields[5],
          seller: fields[6],
          totalCost: fields[7]
      }
      console.log(asset)
      // res.jsonp(asset)  
      req.asset = asset
      next()
    })
    .catch((err) => {
      return res.jsonp(err)  
    })

}

exports.bindMarketPlaces = function(req, res) {

  let asset = req.asset
  let marketPlaces = []

  EthService.getMarketPlacesLengthByAssetId(asset._id)
    .then((length) => {
      console.log('length')
      console.log(length)
      async.times(parseInt(length), (index, callback) => {    
        console.log('index:' + index)
        EthService.getMarketPlaceByAssetIdAndIndex(asset._id, index)
        .then((address) => {
          console.log(address)
          marketPlaces.push(address)
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
          asset.marketPlaces = marketPlaces
          res.jsonp(asset)
        }      
      })
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

  let wallet = req.query.wallet ? req.query.wallet : null
  
  console.log('wallet: ' + wallet)
  
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
        if (!req.query.wallet || wallet.indexOf(fields[5]) > -1 ) {
          assets.push({
            assetAddress: fields[0],
            _id: fields[1].substr(2),
            status: fields[2],
            type: fields[3],
            term: fields[4],
            inventoryCount: fields[5],
            seller: fields[6],
            totalCost: fields[7]
            })
        }
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

}
/**
 * asset middleware
 */
exports.assetByID = function(req, res, next, id) {

  console.log('assetId: ' + id)
  if (!mongoose.Types.ObjectId.isValid(id)) {
    console.log('assetId not found')
    return res.status(400).send({
      message: 'asset is invalid'
    });
  }

  Asset.findById(id)
  .populate('user', 'displayName')
  .exec(function (err, asset) {

    if (err) {
      console.log(err)
      return next(err);
    } else if (!asset) {
      console.log('asset not found')
      return res.status(404).send({
        message: 'No asset with that identifier has been found'
      });
    }
    req.asset = asset;
    next();
  });
};
