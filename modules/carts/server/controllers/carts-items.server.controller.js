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

  console.log(req.body)

  let fromInstagram = req.body.fromInstagram ? req.body.fromInstagram.toString() : 'false'
  console.log('fromInstagram: ' + fromInstagram)

  if (fromInstagram.indexOf('true') > -1) {
    console.log('adding item from instagram')
    createCheckoutFromSocialAccount(req, res)
  } else {
    console.log('just simple add to cart')
    addToCart(req, res)
  }

}


function addToCart (req, res) {

  let cartId = req.body.cart
  let storeId = req.body.store

  getCart(cartId, storeId)
    .then((cart) => {
      res.cookie('cartId', cart.id)
      req.body.cart = cart
      console.log(req.body)
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


function createCheckoutFromSocialAccount(req, res) {

  // console.log(req.body)

  console.log(req.cookies)

  let cartId = req.body.cart
  let storeId = req.body.store
  
  let cart
  let hashtag

  getAffiliateFromStore(storeId)
    .then((res_affiliate)=> {
      console.log('getting affiliate')
      console.log(res_affiliate)
      return getHashtagByInstagram(res_affiliate)
      // return 'baller'
    })
    .then((hashtag)=> {
      console.log('hashtag ' + hashtag)
      return getAssetByHashtag(hashtag)
    })
    .then((res_hashtag)=> {
      console.log('getting hashtag')      
      hashtag = res_hashtag
      return getCart(cartId, storeId) 
    })
    .then((res_cart)=> {
      console.log(res_cart)
      // console.log(asset)
      console.log('adding to cart now!')
      let cartId = res_cart._id

      let cartItem = req.body
      cartItem.cart = res_cart
      cartItem.asset = hashtag.asset
      cartItem.hashtag = hashtag
      cartItem.store = storeId

      CartItem.findOneAndUpdate({ cart: cartId, asset: cartItem.asset._id }, cartItem, { new: true, upsert:true }, (err, result_cartItem) => {
        if (err) {
          console.log(err)
          return res.status(400).send({
            message: errorHandler.getErrorMessage(err)
          })
        } else {
          res.jsonp(result_cartItem)
        }
      })
    })
    .catch((err) => {
      return res.status(400).send({
          message: err.toString()
        })
    })
}

function getAffiliateFromStore(storeId) {

  return new Promise ((resolve, reject) => {
    if (storeId) {
      Store.findById(storeId).populate('affiliate', 'igAccessToken').exec(function(err, store) {
        if (err) {
          reject(err)
        } else if (!store) {
          reject(new Error('STORE NOT FOUND!'))
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
      reject(new Error('Instagram access token not found!'))
    }
    let getProfileUrl = 'https://api.instagram.com/v1/users/self/media/recent/?access_token=' + affiliate.igAccessToken

    curl.get(getProfileUrl)
    .then(({statusCode, body}) => {
      if(statusCode === 200) {
        let tag = JSON.parse(body).data[0].tags[0]
        // console.log(tag)
        resolve(tag)
      } else {
        console.log(statusCode, body)
      }
    })
    .catch(e => {
      console.log(e)
      reject(e)
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

      Hashtag.findOne({ name: hashtag }).populate('asset').exec(function(err, res_hashtag) {
        if (err) {
          reject(err)
        } else if (!res_hashtag) {
          console.log('not hashtag found')
          reject(new Error('No Hashtag found in system for ' + hashtag))
        } else {          
          // console.log('hashtag result form query ')
          // console.log(hashtag)
          resolve(res_hashtag)
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
