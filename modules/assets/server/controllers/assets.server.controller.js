'use strict'

/**
 * Module dependencies.
 */
const path = require('path')
const mongoose = require('mongoose')
const async = require('async')
const Asset = mongoose.model('Asset')
const Hashtag = mongoose.model('Hashtag')
const multer = require('multer')
const config = require(path.resolve('./config/config'))

const errorHandler = require(path.resolve('./modules/core/server/controllers/errors.server.controller'))
const EthService = require(path.resolve('./modules/eth/server/services/eth.server.service'))
const  _ = require('lodash')

/**
 * Create a asset
 */
exports.create = function(req, res) {

  console.log(req.body)

  let asset = new Asset(req.body)
  console.log('assetId: ' + asset._id)
  asset.user = req.user
  asset.save(function(err) {
    if (err) {
      console.log(err)
      return res.status(400).send({
        message: errorHandler.getErrorMessage(err)
      })
    } else {
      res.jsonp(asset)
    }
  })
}


/**
 * Show the current asset
 */
exports.read = function(req, res, next) {

  console.log('gettign asset detail')
  // convert mongoose document to JSON
  let asset = req.asset ? req.asset.toJSON() : {}
  
  asset.isCurrentUserOwner = req.user && asset.user && asset.user._id.toString() === req.user._id.toString() 

  Hashtag.find({asset: asset._id}).sort('-created').exec(function(err, hashtags) {
    if (err) {
      return res.status(400).send({
        message: errorHandler.getErrorMessage(err)
      })
    }
    // console.log(assets)
    asset.hashtags = hashtags
    req.asset = asset
    next()
    // res.jsonp(asset)  
  })


}


/**
 * Update a asset
 */
exports.update = function(req, res) {
  var asset = req.asset
  asset = _.extend(asset, req.body)

  asset.save(function(err) {
    if (err) {
      return res.status(400).send({
        message: errorHandler.getErrorMessage(err)
      })
    } else {
      res.jsonp(asset)
    }
  })
}

/**
 * Delete an asset
 */
exports.delete = function(req, res) {
  var asset = req.asset

  asset.remove(function(err) {
    if (err) {
      return res.status(400).send({
        message: errorHandler.getErrorMessage(err)
      })
    } else {
      res.jsonp(asset)
    }
  })
}

/**
 * List of assets
 */
exports.list = function(req, res) {
 
  Asset.find({}, {}, req.paginate).populate('user', 'displayName').exec(function(err, assets) {
    if (err) {
      console.log(err)
      return res.status(400).send({
        message: errorHandler.getErrorMessage(err)
      })
    }
    res.jsonp(assets)
  })

}


/**
 * List assets for signed in seller
 */

exports.listMyAssets = function(req, res) {
  
  Asset.find({ user : req.user }).sort('-created').populate('user', 'displayName').exec(function(err, assets) {
    if (err) {
      return res.status(400).send({
        message: errorHandler.getErrorMessage(err)
      })
    }
    res.jsonp(assets)
  })

}

/**
 * List Assets Category
 */

exports.listByCategory = function(req, res) {

  let category = req.body.category

  Asset.find({ category : category }).sort('-created').populate('user', 'displayName').exec(function(err, assets) {
    if (err) {
      return res.status(400).send({
        message: errorHandler.getErrorMessage(err)
      })
    }
    res.jsonp(assets)
  })

}

exports.listAll = function(req, res) {

  Asset.find().sort('-created').populate('user', 'displayName').exec(function(err, assets) {
    if (err) {
      return res.status(400).send({
        message: errorHandler.getErrorMessage(err)
      })
    }
    res.jsonp(assets)
  })

}

exports.uploadAssetImage = function(req, res) {

  var upload = multer(config.uploads.assetUpload).single('newAssetImage');
  var profileUploadFileFilter = require(path.resolve('./config/lib/multer')).imageUploadFileFilter;
  
  // Filtering to upload only images
  upload.fileFilter = profileUploadFileFilter;

  upload(req, res, function (uploadError) {
    if(uploadError) {
      console.log(uploadError)
      return res.status(400).send({
        message: 'Error occurred while uploading profile picture'
      })
    } else {
      res.jsonp({ imageURL: config.uploads.assetUpload.dest + req.file.filename })
    }
  })
}

exports.incrementView = function(req, res, next) {
  console.log('asset coming up for incrementing view')
  console.log(req.asset)
  if(!req.asset || req.user) {
    console.log('asset not found in db or to increment view count or you have to be guest role')
    return res.jsonp(req.asset)
  }

  Asset.findByIdAndUpdate(req.asset._id, { $inc: { views: 1 }}, { upsert: true }, function(err, asset) {
    if(err || !asset) {
      console.log('asset not found to update its view count')
    }
    res.jsonp(asset)
  })
}

exports.incrementBuy = function(req, res, next) {

  if(!req.orderItems) {
    console.log('orders are not present, skipping incrementing buy count for assets')
    return res.jsonp(req.order)
  }

  async.each(req.orderItems, (orderItem, callback) => {
    Asset.findByIdAndUpdate(orderItem.asset, { $inc: { buys: 1 }}, function(err, asset) {
      callback()
    })
  }, (err) => {
    if (err) {
      return res.status(400).send({
        message: errorHandler.getErrorMessage(err)
      });
    }
    res.jsonp(req.order);      
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
    })
  }

  Asset.findById(id)
  .populate('user', 'displayName')
  .populate('category', 'name')  
  .exec(function (err, asset) {

    if (err) {
      console.log(err)
      return next(err)
    } else if (!asset) {
      console.log('asset not found')
      return res.status(404).send({
        message: 'No asset with that identifier has been found'
      })
    }
    req.asset = asset
    next()
  })
}
