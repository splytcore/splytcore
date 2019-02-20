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


function createCheckoutFromSocialAccount(req, res) {

  let cartId = req.body.cart
  let storeId = req.body.store
  
  // let cart
  let hashtags
  let overviewImgUrl

  getAffiliateFromStore(storeId)
    .then((res_affiliate)=> {
      console.log('getting affiliate')
      // console.log(res_affiliate)
      return getHashtagsByInstagram(res_affiliate)
      // return 'baller'
    })
    .then((res_igMeta)=> { 
      // res_igMeta = [{tags: [], overviewImgUrl: 'image url'},{tags: [], overviewImgUrl: 'image url'}...]
      // TODO: scott use the whole res_igMeta array and find assets from our database. instead of only the first post  
      overviewImgUrl = res_igMeta[0].overviewImgUrl
      return res_igMeta[0].tags
    })
    .then((res_hashtags)=> {
      console.log('getting hashtag')      
      hashtags = res_hashtags
      return getCart(cartId, storeId) 
    })
    .then((res_cart)=> {
      // console.log(res_cart)
      // console.log(asset)
      console.log('adding to cart now!')
      let cartId = res_cart._id
      async.each(hashtags, (hashtag, callback) => {
        let cartItem = req.body
        cartItem.cart = res_cart
        cartItem.asset = hashtag.asset
        cartItem.hashtag = hashtag
        cartItem.store = storeId
        CartItem.findOneAndUpdate({ cart: cartId, asset: cartItem.asset._id }, cartItem, { new: true, upsert:true }, (err, result_cartItem) => {
          callback(err)
        })
      }, (err) => {
        if (err) {
          return Promise.reject(err)
        } else {
          res_cart.overviewImageUrl = overviewImgUrl      
          res_cart.save((err) => {
            res.jsonp(res_cart)
          })
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
function getHashtagsByInstagram(affiliate) {
  return new Promise((resolve, reject) => {
    if(!affiliate.igAccessToken){
      reject(new Error('Instagram access token not found!'))
    }
    let getProfileUrl = 'https://api.instagram.com/v1/users/self/media/recent/?access_token=' + affiliate.igAccessToken

    curl.get(getProfileUrl)
    .then(({statusCode, body}) => {
      if(statusCode === 200) {
        let bodyJson = JSON.parse(body)
        let tags = bodyJson.data[0].tags
        let response = []
        async.each(bodyJson.data, (post, callback) => {
          response.push({
            tags: post.tags,
            overviewImgUrl: post.images.standard_resolution.url
          })
          callback()
        }, err => {
          if(err) {
            console.log('Couldnt fetch all posts')
            return reject('Couldnt fetch all posts')
          }
          resolve(response)
        })
      } else {
        console.log(statusCode, body)
        reject(JSON.parse(body).meta.error_message)
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
function getAssetsByHashtag (tags) {

  return new Promise ((resolve, reject) => {
      let hashtags = []
      async.each(tags, (tag, callback) => {
        Hashtag.findOne({ name: tag }).populate('asset').exec(function(err, res_hashtag) {
          if (res_hashtag) {
            hashtags.push(res_hashtag)
          }
          callback(err)
        })
      }, (err) => {
        if (err) {
          reject(err)
        } else {
          resolve(hashtags)
        }
      })
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
