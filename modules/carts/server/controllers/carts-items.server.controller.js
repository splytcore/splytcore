'use strict';

/**
 * Module dependencies.
 */
const path = require('path')
const mongoose = require('mongoose')
const Asset = mongoose.model('Asset')
const Store = mongoose.model('Store')
const Cart = mongoose.model('Cart')
const CartItem = mongoose.model('CartItem')
const errorHandler = require(path.resolve('./modules/core/server/controllers/errors.server.controller'))
const  _ = require('lodash')

/**
 * Create a Shopping Cart if there's none assigned
 * Then adds an item
 */
exports.create = function(req, res) {

  let storeId = req.body.store
  if (storeId) {
    createCheckoutFromSocialAccount(req, res)
  } else {
    addToCart(req, res)
  }

}


function addToCart (req, res) {

  let cartId = req.body.cart

  getCart(cartId)
    .then((cart) => {
      let cartItem = new CartItem(req.body)
      cartItem.cart = cart
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
    .catch((err) => {
      return res.status(400).send({
        message: errorHandler.getErrorMessage(err)
      })                
    })
}


function createCheckoutFromSocialAccount(req, res) {

  console.log(req.body)

  let cartId = req.body.cart
  let storeId = req.body.store
  
  let cart
  let store
  let asset


  getAffiliateFromStore(storeId)
    .then((affiliate)=> {
      console.log(affiliate)
      return getHashtagByInstagram(affiliate)
    })
    .then((hashtag)=> {
      console.log('hashtag ' + hashtag)
      return getAssetByHashtag(hashtag)
      
    })
    .then((res_asset)=> {
      asset = res_asset
      return getCart(cartId) 
    })
    .then((res_cart)=> {
      // console.log(cart)
      // console.log(asset)
      var cartItem = new CartItem(req.body)
      cartItem.cart = res_cart
      cartItem.asset = asset
      cartItem.store = store
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
    .catch((err) => {
      return res.status(400).send({
          message: errorHandler.getErrorMessage(err)
        })
    })
}

function getAffiliateFromStore(storeId) {

  return new Promise ((resolve, reject) => {
    if (storeId) {
      Store.findById(storeId).populate('affiliate', 'instagram').exec(function(err, store) {
        if (err) {
          reject(err)
        } else {
          resolve(store.affiliate)
        }
      })
    } else {
      resolve()
    }
  })

}
//TODO: this is where we'll crawl their instgram account and grab the hashtags or hashtag ids
//JOSH THIS IS FOR YOU
function getHashtagByInstagram(affiliate) {
  console.log('get instgram from affiliate and grabi hashtag from the feed')
  console.log(affiliate)
  return Promise.resolve('redshoes')

}

/*
* Finds current existing cart header
* Creates new one if it doesn't exist
*/
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


// Find Asset by hashtag
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
