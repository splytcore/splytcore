'use strict'

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

  return res.jsonp(asset)  

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


  // let listType = req.query.listType ? req.query.listType.toUpperCase() : null
  // console.log(listType)

  console.log(req.query)
  Asset.find(req.query).sort('-created').populate('user', 'displayName').exec(function(err, assets) {
    if (err) {
      return res.status(400).send({
        message: errorHandler.getErrorMessage(err)
      })
    }
    console.log(assets)
    res.jsonp(assets)
  })



  // switch(listType) {
  //     case 'ASSETS.LISTMYASSETS':
  //          exports.listMyAssets(req,res)
  //         break                       
  //     case 'ASSETS.LISTBYCATEGORY':
  //          exports.listByCategory(req,res)
  //         break    
  //     default:
  //          exports.listAll(req,res)
  // }

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
