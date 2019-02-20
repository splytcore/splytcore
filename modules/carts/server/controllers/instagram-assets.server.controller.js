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

  let affiliate = req.store.affiliate

  // let cart
  let hashtags
  let overviewImgUrl

  getHashtagsByInstagram(res_affiliate)
    .then((res_instagramArray)=> {
      console.log('hashtags ')
      console.log(res_instagramArray)

      // console.log('overviewimgURL ' + res_tags.overviewImgUrl)    
      // overviewImgUrl = res_tags.overviewImgUrl
      return getAssetsByHashtagAndAffiliateId(res_instagramArray, affiliate.id)
    })
    .then((res_instagramAssetsArray)=> {
      res.jsonp(res_instagramAssetsArray)
    })
    .catch((err) => {
      return res.status(400).send({
          message: err.toString()
        })
    })
}

//TODO: this is where we'll crawl their instgram account and grab the hashtags or hashtag ids
//JOSH THIS IS FOR YOU
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



// Find Asset by hashtag
function getAssetsByHashtagAndAffiliateId(instagramArray, affiliateId) {

  return new Promise ((resolve, reject) => {
    
    let instagramAssetsArray = []

    async.each(instagramArray, (instagram, callback) => {  
        
        let tags = instagram.tags
        let instagramAssets = new InstagramAssets()

        async.each(tags, (tag, callback2) => {
          Hashtag.findOne({ name: tag, affiliate: affiliateId }).populate('asset').exec(function(err, res_hashtag) {
            if (res_hashtag) {
              InstagramAssets.assets.push({ id : res_hashtag.asset.id, title: res_hashtag.asset.title, price: res_hashtag.asset.price })
            }
            callback2(err)
          })
        }, (err) => {
          instagramAssetsArray.push(instagramAssets)
          callback(err)
        })
    }, (err) => {
      if (err) {
        reject(err)
      } else {
        resolve(instagramAssetsArray)
      }
    })
  })
}

/**
 * Show the current cartItem
 */
// exports.read = function(req, res) {
//   // convert mongoose document to JSON
//   var cartItem = req.cartItemItem ? req.cartItem.toJSON() : {};

//   // Add a custom field to the Article, for determining if the current User is the "owner".
//   // NOTE: This field is NOT persisted to the database, since it doesn't exist in the Article model.
//   // cartItem.isCurrentUserOwner = req.user && cartItem.user && cartItem.user._id.toString() === req.user._id.toString();

//   res.jsonp(cartItem);
// };


/**
 * List of cartItems
 */
exports.list = function(req, res) {
  let id = req.params.instgramAssets._id

  InstagramAssets.findById(id).populate('assets').exec(function(err, instagramAssets) {
    if (err) {
      return res.status(400).send({
        message: errorHandler.getErrorMessage(err)
      });
    } else {
      res.jsonp(instagramAssets);
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
