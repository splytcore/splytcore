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
const Hashtag = mongoose.model('Hashtag')

const errorHandler = require(path.resolve('./modules/core/server/controllers/errors.server.controller'))
const  _ = require('lodash')
const curl = new (require('curl-request'))()

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

  let cartId = req.cookies ? req.cookies.cartId  : null

  getCart(cartId)
    .then((cart) => {
      res.cookie('cartId', cart._id.toString())
      req.body.cart = cart
      console.log(req.body)
      CartItem.findOneAndUpdate({ cart: cart._id, asset: req.body.asset }, req.body, { upsert:true }, (err, cartItem) => {
        if (err) {
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


function createCheckoutFromSocialAccount(req, res) {

  // console.log(req.body)

  console.log(req.cookies)

  let cartId = req.cookies ? req.cookies.cartId : null
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
      res.cookie('cartId', res_cart._id.toString())

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
      Store.findById(storeId).populate('affiliate', 'igAccessToken').exec(function(err, store) {
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
  return new Promise((resolve, reject) => {
    if(!affiliate.igAccessToken){
      reject()
    }
    let getProfileUrl = 'https://api.instagram.com/v1/users/self/media/recent/?access_token=' + affiliate.igAccessToken

    curl.get(getProfileUrl)
    .then(({statusCode, body}) => {
      if(statusCode === 200) {
        let tag = JSON.parse(body).data[0].tags[0]
        console.log(tag)
        resolve(tag)
      } else {
        console.log(statusCode, body)
      }
    })
    .catch(e => {
      console.log(e)
      reject()
    })
  })
  
  
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

      Hashtag.findOne({ name: hashtag }).populate('asset').exec(function(err, hashtag) {
        if (err) {
          reject(err)
        } else {
          console.log('hashtag result form query ')
          console.log(hashtag.asset)
          resolve(hashtag.asset)
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
