'use strict';

/**
 * Module dependencies.
 */
const path = require('path')
const mongoose = require('mongoose')
const Asset = mongoose.model('Asset')
const Cart = mongoose.model('Cart')
const CartItem = mongoose.model('CartItem')
const errorHandler = require(path.resolve('./modules/core/server/controllers/errors.server.controller'))
const  _ = require('lodash')

/**
 * Create a Item
 */
exports.create = function(req, res) {

  console.log(req.body)

  let cart = null

  getCart(req.body.cart)
    .then((res_cart)=> {
      // console.log('cart')
      // console.log(res_cart)
      cart = res_cart
      return getAssetByHashtag(req.body.hashtag)
    })
    .then((asset)=> {
      // console.log(cart)
      // console.log(asset)
      var cartItem = new CartItem(req.body)
      cartItem.cart = cart
      cartItem.asset = asset ? asset : cartItem.asset
      cartItem.save(function(err) {
        if (err) {
          return res.status(400).send({
            message: errorHandler.getErrorMessage(err)
          })
        } else {
          console.log(cartItem)
          res.jsonp(cartItem)
        }
      })
    })
}

function getCart(cartId) {

  return new Promise ((resolve, reject) => {
    if (!cartId) {
      // console.log('create new cart')
      let cart = new Cart()
      cart.save((err) => {
        if (err) {
          reject(err)
        } else {
          resolve(cart)
        }
      })
    } else  {
      // console.log('cart exist already')
      Cart.findById(cartId).exec(function(err, cart) {
        if (err) {
          reject(err)
        } else {
          resolve(cart)
        }
      })
    }
  })
}



function getAssetByHashtag (hashtag) {

  return new Promise ((resolve, reject) => {
    if (!hashtag) {
        console.log('no hashtag included')
        resolve(null)
    } else  {
      Asset.findOne({ hashtag: hashtag }).exec(function(err, asset) {
        if (err) {
          reject(err)
        } else {
          console.log('hashtag result form query ')
          console.log(asset)
          resolve(asset)
        }

      })
    }
  })
}

/**
 * Show the current cartItem
 */
exports.read = function(req, res) {
  // convert mongoose document to JSON
  var cartItem = req.cartItemItem ? req.cartItem.toJSON() : {};

  // Add a custom field to the Article, for determining if the current User is the "owner".
  // NOTE: This field is NOT persisted to the database, since it doesn't exist in the Article model.
  // cartItem.isCurrentUserOwner = req.user && cartItem.user && cartItem.user._id.toString() === req.user._id.toString();

  res.jsonp(cartItem);
};

/**
 * Update a cartItem
 */
exports.update = function(req, res) {
  var cartItem = req.cartItem;

  cartItem = _.extend(cartItem, req.body);

  cartItem.save(function(err) {
    if (err) {
      return res.status(400).send({
        message: errorHandler.getErrorMessage(err)
      });
    } else {
      res.jsonp(cartItem);
    }
  });
};

/**
 * Delete an cartItem
 */
exports.delete = function(req, res) {
  var cartItem = req.cartItem;

  cartItem.remove(function(err) {
    if (err) {
      return res.status(400).send({
        message: errorHandler.getErrorMessage(err)
      });
    } else {
      res.jsonp(cartItem);
    }
  });
};

/**
 * List of cartItems
 */
exports.list = function(req, res) {
  CartItem.find().sort('-created').populate('user', 'displayName').exec(function(err, cartItems) {
    if (err) {
      return res.status(400).send({
        message: errorHandler.getErrorMessage(err)
      });
    } else {
      res.jsonp(cartItems);
    }
  });
};

/**
 * cartItem middleware
 */
exports.cartItemByID = function(req, res, next, id) {

  if (!mongoose.Types.ObjectId.isValid(id)) {
    return res.status(400).send({
      message: 'cartItem is invalid'
    });
  }

  CartItem.findById(id).populate('user', 'displayName').exec(function (err, cartItem) {
    if (err) {
      return next(err);
    } else if (!cartItem) {
      return res.status(404).send({
        message: 'No cartItem with that identifier has been found'
      });
    }
    req.cartItem = cartItem;
    next();
  });
};
