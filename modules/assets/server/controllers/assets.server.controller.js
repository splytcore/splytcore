'use strict';

/**
 * Module dependencies.
 */
const path = require('path')
const mongoose = require('mongoose')
const async = require('async')
const Asset = mongoose.model('Asset')
const errorHandler = require(path.resolve('./modules/core/server/controllers/errors.server.controller'))
const EthService = require(path.resolve('./modules/eth/server/services/eth.server.service'))
const  _ = require('lodash')
const assetService = require(path.resolve('./modules/assets/server/services/assets.server.service.js'))

/**
 * Create a asset
 */
exports.create = function(req, res) {
  req.body.user = req.user
  assetService.createAsset(new Asset(req.body), (err, result) => {
    if(err)
      return res.status(400).send({
        message: errorHandler.getErrorMessage(err)
      });
    res.jsonp(result)
    })
}


/**
 * Show the current asset
 */
exports.read = function(req, res, next) {

  console.log('gettign asset detail')
  // convert mongoose document to JSON
  let asset = req.asset ? req.asset.toJSON() : {}
  // asset.isCurrentUserOwner = req.user && asset.user && asset.user._id.toString() === req.user._id.toString() 

  EthService.getAssetInfoByAssetId(asset._id)
    .then((fields) => {
      console.log('successful get asset info')
      console.log(fields)
      asset.address = fields[0]
      asset.status = fields[2]
      asset.type = fields[3]         
      asset.term = fields[4]
      asset.inventoryCount = fields[5]
      asset.seller = fields[6]
      asset.totalCost = fields[7]
      console.log(asset)
      req.asset = asset
      next()
    })
    .catch((err) => {
      return res.jsonp(err)  
    })

}


/**
 * Show the current asset
 */
exports.returnAsset = function(req, res) {

  console.log('return asset detail')
  let asset = req.asset
  console.log(asset)
  res.jsonp(asset)

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


  let listType = req.query.listType ? req.query.listType.toUpperCase() : null
  console.log(listType)

  switch(listType) {
      case 'ASSETS.LISTPENDING':
          exports.listPending(req,res)
          break
      case 'ASSETS.LIST':
           exports.listAllMined(req,res)
          break
      case 'ASSETS.LISTFRACTIONAL':
          exports.listByType(1, req,res)
          break
      case 'ASSETS.LISTNORMAL':
           exports.listByType(0, req,res)
          break
      case 'ASSETS.LISTMYASSETS':
           exports.listMyAssets(req,res)
          break                       
      default:
           exports.listAllMined(req,res)
  }

}

exports.getAllAssetsFromContract = function(req, res, next) {
  
  let listType = req.query.listType ? req.query.listType.toUpperCase() : null    

  if (listType.indexOf('ASSETS.LISTPENDING') > -1) {
    console.log('no need to fetch fom contracts')
    next()
  } else {
    let assets = []
    EthService.getAssetsLength()
    .then((length) => {
      console.log('number of assets listed' + length)
      async.times(parseInt(length), (index, callback) => {    
        console.log('index:' + index)
        EthService.getAssetInfoByIndex(index)
        .then((fields) => {
          // console.log(fields)
          // return (address(asset), asset.assetId(), asset.status(), asset.term(), asset.inventoryCount(), asset.seller(), asset.totalCost());
          assets.push({
              address: fields[0],
              _id: fields[1].substr(2),
              status: fields[2],
              type: fields[3],
              term: fields[4],
              inventoryCount: fields[5],
              seller: fields[6],
              totalCost: fields[7]
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
          req.assets = assets
          next()
        }      
      })
    })
    .catch((err) => {
      res.jsonp(err)
    })  
  }
}

exports.listByType = function(type, req, res) {
  
  let assets = []

  async.each(req.assets, (asset, callback) => {    
    
    if (parseInt(asset.type) === type) {
      assets.push(asset)
    }    
    callback()
  }, (err) => {
    if (err) {
      return res.status(400).send({
        message: errorHandler.getErrorMessage(err)
      });
    } else {
      res.jsonp(assets);
    }      
  })

}

exports.listPending = function(req, res) {
  
  Asset.find().sort('-created').populate('user', 'displayName').exec(function(err, assets) {
    if (err) {
      return res.status(400).send({
        message: errorHandler.getErrorMessage(err)
      });
    } else {
      let pendingAssets = []
      async.each(assets, (asset, callback) => {    
        console.log('trxHash:' + asset.transactionHash)
        if (asset.transactionHash) {
          EthService.getTransaction(asset.transactionHash)
          .then((result) => {
            // return (address(asset), asset.assetId(), asset.status(), asset.term(), asset.inventoryCount(), asset.seller(), asset.totalCost());
            let blockNumber = result && result.blockNumber ? parseInt(result.blockNumber) : 0
            if (blockNumber === 0 || !result) {
              pendingAssets.push(asset)
            }
            callback()
          })
          .catch((err) => {
            console.log(err)
            callback(err)
          })  
        } else {
          callback()
        }
      }, (err) => {
        if (err) {
          return res.status(400).send({
            message: errorHandler.getErrorMessage(err)
          });
        } else {
          res.jsonp(pendingAssets);
        }      
      })
    }
  })

}

exports.listAllMined = function(req, res) {

  res.jsonp(req.assets)
 
}

exports.bindTitleAndDescription = function(req, res, next) {

  let assets = req.assets
  async.each(assets, (asset, callback) => {
    Asset.findById(asset._id)
      .exec(function (err,  a) {
        
        asset.title =  a ? a.title : 'NOT_FOUND_IN_DB'
        asset.description = a ? a.description : 'NOT_FOUND_IN_DB'
        callback(err)
      })

  }, (err) => {
    if (err) {
      return res.status(400).send({
        message: errorHandler.getErrorMessage(err)
      })
    }
    req.assets = assets 
    next()
  }) 
}

exports.listMyAssets = function(req, res) {

  let wallet = req.user.publicKey.toUpperCase()
  
  console.log('wallet: ' + wallet)

  let assets = []

  async.each(req.assets, (asset, callback) => {    
    
    if (asset.seller.toUpperCase().indexOf(wallet) > -1) {
      assets.push(asset)
    }    
    callback()
  }, (err) => {
    if (err) {
      return res.status(400).send({
        message: errorHandler.getErrorMessage(err)
      });
    } else {
      res.jsonp(assets);
    }      
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


exports.getAssetByAddress = function(req, res, next, address) {

  console.log('address: ' + address)

  let asset = {}
  EthService.getAssetInfoByAddress(address)
    .then((fields) => {

      console.log('successful get asset info')
      console.log(fields)
      asset.address = fields[0]
      asset._id = fields[1]
      asset.status = fields[2]
      asset.type = fields[3]         
      asset.term = fields[4]
      asset.inventoryCount = fields[5]
      asset.seller = fields[6]
      asset.totalCost = fields[7]
      console.log(asset)
      req.asset = asset
      next()
    })
    .catch((err) => {
      return next(err)  
    })

}
