'use strict'

/**
 * Module dependencies.
 */
var path = require('path'),
  mongoose = require('mongoose'),
  Shopify = mongoose.model('Shopify'),
  errorHandler = require(path.resolve('./modules/core/server/controllers/errors.server.controller')),
  _ = require('lodash'),
  axios = require('axios'),
  chalk = require('chalk'),
  shopifyService = require(path.resolve('./modules/shopifies/server/services/shopify.server.service.js')),
  assetService = require(path.resolve('./modules/assets/server/services/assets.server.service.js'))

/**
 * Create a Shopify
 */
exports.create = function(req, res) {

  var shopify = new Shopify({
    shopName: req.body.shopName,
    accessToken: req.body.accessToken ? req.body.accessToken : '',
    user: req.user
  })

  shopify.save(function(err) {
    if (err) {
      return res.status(400).send({
        message: errorHandler.getErrorMessage(err)
      })
    } else {
      res.jsonp(shopify)
    }
  })
}

/**
 * Show the current Shopify
 */
exports.read = function(req, res) {
  // convert mongoose document to JSON
  var shopify = req.shopify ? req.shopify.toJSON() : {}

  // Add a custom field to the Article, for determining if the current User is the "owner".
  // NOTE: This field is NOT persisted to the database, since it doesn't exist in the Article model.
  //shopify.isCurrentUserOwner = req.user && shopify.user && shopify.user._id.toString() === req.user._id.toString()

  res.jsonp(shopify)
}

/**
 * Update a Shopify
 */
exports.update = function(req, res) {
  var shopName = req.body.shopName
  Shopify.findOne({ shopName: shopName}, (err, shopify) => {
    if (err) {
    return res.status(400).send({
        message: errorHandler.getErrorMessage(err)
      })
    } else {
      var getTokenUrl = 'https://' + shopify.shopName + '/admin/oauth/access_token'
      var body = {
        client_id: process.env.shopifyAppApiKey,
        client_secret: process.env.shopifyAppSecretKey,
        code: req.body.accessToken
      }
      axios.post(getTokenUrl, body).then(response => {
        shopify = _.extend(shopify, {accessToken: response.data.access_token})
        shopify.save((err, shopify) => {
          if (err) {
            return res.status(400).send({
              message: errorHandler.getErrorMessage(err)
            })
          } else {
            res.jsonp(shopify)
          }
        })

      })
      .catch(err => {
        console.log(chalk.red('Errored out calling', getTokenUrl))
        console.log(err)
      })
    }
  })
}

/**
 * Delete an Shopify
 */
exports.delete = function(req, res) {
  var shopify = req.shopify

  shopify.remove(function(err) {
    if (err) {
      return res.status(400).send({
        message: errorHandler.getErrorMessage(err)
      })
    } else {
      res.jsonp(shopify)
    }
  })
}

/**
 * List of Shopifies
 */
exports.list = function(req, res) {
  Shopify.find({ user: req.user.id }).sort('-created').populate('user', 'displayName').exec(function(err, shopifies) {
    if (err) {
      return res.status(400).send({
        message: errorHandler.getErrorMessage(err)
      })
    } else {
      res.jsonp(shopifies)
    }
  })
}

/**
 * List inventory from Shopify store
 */
exports.pullShopify = function(req, res) {
  var products = []
  var axiosConfig = {
    headers: {
      'X-Shopify-Access-Token' : req.shopify.accessToken
    }
  }
  var getProductsUrl = 'https://' + req.shopify.shopName + '/admin/api/2019-07/products.json'
  console.log(getProductsUrl)
  axios.get(getProductsUrl, axiosConfig)
  .then(resp => {
    res.json(resp.data.products)
  })
  .catch(err => {
    console.log(err)
  })
}

exports.pushBlockchain = function(req, res) {
  req.body.forEach(product => {
    shopifyService.convertToAsset(product, asset => {
      asset.user = req.user
      asset.marketPlaces.push("0x427A21A69C3D7949b4ECEd0437Df91ee01c255d6")
      asset.marketPlacesAmount.push(2)
      asset.seller = req.user.publicKey
      assetService.createAsset(asset, (err, result) => {
        if(err)
          console.log(err)
      })
    })
  })

  res.jsonp({message: 'success'})
}

exports.itemBought = function(req, res, next) {
  console.log('body', req.body)
  console.log('headers', req.headers)
  console.log('params', req.params)
  assetService.findByTitle(req.body.line_items[0].title, assetAddress => {
    console.log('asset address:', assetAddress)
    if(!assetAddress)
      return res.status(400).send({message: 'Asset not found'})

    var newBody = {
      marketPlace: '0x92389eB6c277B71CDe8bd633F8fd00f924e0f771',
      amount: Math.floor(req.body.line_items[0].price * 100),
      quantity: req.body.line_items[0].quantity,
      status: 0,
      buyerWallet: '0x92389eB6c277B71CDe8bd633F8fd00f924e0f771',
      assetAddress: assetAddress
    }
    req.body = newBody
    next()
  })

}

/**
 * Shopify middleware
 */
exports.shopifyByID = function(req, res, next, id) {

  if (!mongoose.Types.ObjectId.isValid(id)) {
    return res.status(400).send({
      message: 'Shopify is invalid'
    })
  }

  Shopify.findById(id).populate('user', 'displayName').exec(function (err, shopify) {
    if (err) {
      return next(err)
    } else if (!shopify) {
      return res.status(404).send({
        message: 'No Shopify with that identifier has been found'
      })
    }
    req.shopify = shopify
    next()
  })
}

exports.shopifyByShopName = function(req, res, next, shopName) {
  console.log('shopName', shopName)
  Shopify.findOne({shopName: shopName}).exec( (err, shopify) => {
    if(err){
      return next(err)
    }
    else if(!shopify){
      return res.status(404).send({
        messsage: 'No Shopify with that shopName has been found'
      })
    }
    console.log('shopfiyByShopName', shopify)
    req.shopify = shopify
    next()
  })
}
