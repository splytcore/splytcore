'use strict';

/**
 * Module dependencies.
 */
var path = require('path'),
  mongoose = require('mongoose'),
  Cart = mongoose.model('Cart'),
  CartItem = mongoose.model('CartItem'),  
  errorHandler = require(path.resolve('./modules/core/server/controllers/errors.server.controller')),
  _ = require('lodash');

/**
 * Create a Cart
 */
exports.create = function(req, res) {
  var cart = new Cart(req.body);
  // cart.customer = req.user;

  cart.save(function(err) {
    if (err) {
      return res.status(400).send({
        message: errorHandler.getErrorMessage(err)
      });
    } else {
      res.jsonp(cart);
    }
  });
};

/**
 * Show the current Cart
 */
exports.read = function(req, res) {
  // convert mongoose document to JSON
  var cart = req.cart ? req.cart.toJSON() : {}

  CartItem.find({ cart: cart._id }).sort('-created').populate('asset').exec(function(err, cartItems) {
    if (err) {
      return res.status(400).send({
        message: errorHandler.getErrorMessage(err)
      })
    }
    cart.totalQuantity = cartItems.reduce((total, i) => total + i.quantity, 0)
    cart.totalCost = cartItems.reduce((total, i) => total + i.asset.price * i.quantity, 0)

    cart.cartItems = cartItems
    res.jsonp(cart)
  })

}

/**
 * Update a Cart
 */
exports.update = function(req, res) {
  var cart = req.cart;

  cart = _.extend(cart, req.body);

  cart.save(function(err) {
    if (err) {
      return res.status(400).send({
        message: errorHandler.getErrorMessage(err)
      });
    } else {
      res.jsonp(cart);
    }
  });
};

/**
 * Delete an Cart
 */
exports.delete = function(req, res) {
  
  res.clearCookie('cartId')
  
  var cart = req.cart

  //removes all items
  CartItem.remove({ cart : cart._id }, function(err) {
    if (err) {
      console.log(err)
    } else {
      console.log('successful delete cart item')
    }
  })

  //remove the header
  cart.remove(function(err) {
    if (err) {
      return res.status(400).send({
        message: errorHandler.getErrorMessage(err)
      });
    } else {
      res.jsonp(cart)
    }
  });
};

/**
 * List of Carts
 */
exports.list = function(req, res) {
  Cart.find().sort('-created').populate('user', 'displayName').exec(function(err, carts) {
    if (err) {
      return res.status(400).send({
        message: errorHandler.getErrorMessage(err)
      });
    } else {
      res.jsonp(carts);
    }
  });
};

/**
 * Cart middleware
 */
exports.cartByID = function(req, res, next, id) {
  console.log('cartId ' + id)
  if (!mongoose.Types.ObjectId.isValid(id)) {
    return res.status(400).send({
      message: 'Cart is invalid'
    });
  }

  Cart.findById(id).populate('user', 'displayName').exec(function (err, cart) {
    if (err) {
      return next(err);
    } else if (!cart) {
      return res.status(404).send({
        message: 'No Cart with that identifier has been found'
      });
    }
    req.cart = cart;
    next();
  });
};
