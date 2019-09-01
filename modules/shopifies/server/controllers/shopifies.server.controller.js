'use strict';

/**
 * Module dependencies.
 */
var path = require('path'),
  mongoose = require('mongoose'),
  Shopify = mongoose.model('Shopify'),
  errorHandler = require(path.resolve('./modules/core/server/controllers/errors.server.controller')),
  _ = require('lodash'),
  axios = require('axios'),
  chalk = require('chalk');

/**
 * Create a Shopify
 */
exports.create = function(req, res) {

  var shopify = new Shopify({
    shopName: req.body.name,
    user: req.user
  })

  shopify.save(function(err) {
    if (err) {
      return res.status(400).send({
        message: errorHandler.getErrorMessage(err)
      });
    } else {
      res.jsonp(shopify);
    }
  });
};

/**
 * Show the current Shopify
 */
exports.read = function(req, res) {
  // convert mongoose document to JSON
  var shopify = req.shopify ? req.shopify.toJSON() : {};

  // Add a custom field to the Article, for determining if the current User is the "owner".
  // NOTE: This field is NOT persisted to the database, since it doesn't exist in the Article model.
  shopify.isCurrentUserOwner = req.user && shopify.user && shopify.user._id.toString() === req.user._id.toString();

  res.jsonp(shopify);
};

/**
 * Update a Shopify
 */
exports.update = function(req, res) {

  Shopify.findOne((err, shopify) => {
    if (err) {
      return res.status(400).send({
        message: errorHandler.getErrorMessage(err)
      });
    } else {
      var getTokenUrl = 'https://' + shopify.shopName + '.myshopify.com/admin/oauth/access_token'
      var body = {
        client_id: process.env.shopifyAppApiKey,
        client_secret: process.env.shopifyAppSecretKey,
        code: req.body.accessToken
      }
      axios.post(getTokenUrl, body).then(response => {
        shopify = _.extend(shopify, {accessToken: response.data.access_token});
        shopify.save((err, shopify) => {
          if (err) {
            return res.status(400).send({
              message: errorHandler.getErrorMessage(err)
            });
          } else {
            res.jsonp(shopify);
          }
        })

      })
      .catch(err => {
        console.log(chalk.red('Errored out calling', getTokenUrl))
        console.log(err)
      })
    }
  });
};

/**
 * Delete an Shopify
 */
exports.delete = function(req, res) {
  var shopify = req.shopify;

  shopify.remove(function(err) {
    if (err) {
      return res.status(400).send({
        message: errorHandler.getErrorMessage(err)
      });
    } else {
      res.jsonp(shopify);
    }
  });
};

/**
 * List of Shopifies
 */
exports.list = function(req, res) {
  Shopify.find({ user: req.user.id }).sort('-created').populate('user', 'displayName').exec(function(err, shopifies) {
    if (err) {
      return res.status(400).send({
        message: errorHandler.getErrorMessage(err)
      });
    } else {
      res.jsonp(shopifies);
    }
  });
};

/**
 * List inventory from Shopify store
 */
exports.pullShopify = function(req, res) {
  var axiosConfig = {
    headers: {
      'X-Shopify-Access-Token' : req.shopify.accessToken
    }
  }
  var getCollectsUrl = 'https://' + req.shopify.shopName + '.myshopify.com/admin/api/2019-07/collects.json'
  axios.get(getCollectsUrl, axiosConfig)
  .then(getCollectsRes => {
    console.log(getCollectsRes.data)
    var getProductsPerCollect = 'https://' + req.shopify.shopName + '.myshopify.com/admin/api/2019-07/products.json?collection_id=' + getCollectsRes.data.collects[0].collection_id
    axios.get(getProductsPerCollect, axiosConfig)
    .then(getProductsResponse => {
      console.log(getProductsResponse.data)
      res.json(getProductsResponse.data)
    })
    .catch(err => {
      console.log(err)
    })
  })
  .catch(err => {
    console.log(err)
  })
}

var distinctCollects = (value, index, self) => {
  return self.indexOf(value) === index;
}

/**
 * Shopify middleware
 */
exports.shopifyByID = function(req, res, next, id) {

  if (!mongoose.Types.ObjectId.isValid(id)) {
    return res.status(400).send({
      message: 'Shopify is invalid'
    });
  }

  Shopify.findById(id).populate('user', 'displayName').exec(function (err, shopify) {
    if (err) {
      return next(err);
    } else if (!shopify) {
      return res.status(404).send({
        message: 'No Shopify with that identifier has been found'
      });
    }
    req.shopify = shopify;
    next();
  });
};
