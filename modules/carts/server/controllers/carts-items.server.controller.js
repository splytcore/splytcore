'use strict';

/**
 * Module dependencies.
 */
const path = require('path')
const async = require('async')
const mongoose = require('mongoose')
const Asset = mongoose.model('Asset')
const Store = mongoose.model('Store')
const Cart = mongoose.model('Cart')
const CartItem = mongoose.model('CartItem')

const InstagramAssets = mongoose.model('InstagramAssets')

const Hashtag = mongoose.model('Hashtag')

const errorHandler = require(path.resolve('./modules/core/server/controllers/errors.server.controller'))
const  _ = require('lodash')
const curl = new (require('curl-request'))()

/**
 * Create a Shopping Cart if there's none assigned
 * Then adds an item
 */
exports.create = function(req, res) {

  console.log(req.body)

  let cartId = req.body.cart
  let storeId = req.body.store

  getCart(cartId, storeId)
    .then((cart) => {
      res.cookie('cartId', cart.id)
      req.body.cart = cart
      // console.log(req.body)
      CartItem.findOneAndUpdate({ cart: cart.id, asset: req.body.asset }, req.body, { new: true, upsert:true }, (err, cartItem) => {
        if (err) {
          console.log(err)
          return res.status(400).send({
            message: errorHandler.getErrorMessage(err)
          })
        } else {
          // console.log(cartItem)
          res.jsonp(cartItem)
        }
      })
    })
    .catch((err) => {
      return res.status(400).send({
        message: errorHandler.getErrorMessage(err)
      })                
    })
}

/*
* Finds current existing cart header
* Creates new one if it doesn't exist
*/
function getCart(cartId, storeId) {

  return new Promise ((resolve, reject) => {
    if (!cartId) {
      console.log('create new cart')
      let cart = new Cart()
      cart.save((err) => {
        if (err) {
          reject(err)
        } else {
          resolve(cart)
        }
      })
    } else  {
      console.log('cart exist already')
      Cart.findById(cartId).populate('customer').exec(function(err, cart) {
        if (err) {
          reject(err)
        } else if (!cart) {
          let cart2 = new Cart()
          cart2.save((err) => {
            if (err) {
              reject(err)
            } else {
              resolve(cart2)
            }  
          })             
        } else {
          resolve(cart)
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
