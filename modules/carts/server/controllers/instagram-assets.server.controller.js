'use strict';

/**
 * Module dependencies.
 */
const path = require('path')
const async = require('async')
const mongoose = require('mongoose')
const InstagramAssets = mongoose.model('InstagramAssets')
const Hashtag = mongoose.model('Hashtag')
const Asset = mongoose.model('Asset')
const errorHandler = require(path.resolve('./modules/core/server/controllers/errors.server.controller'))
const  _ = require('lodash')
const curl = new (require('curl-request'))()

/**
 * Create a Shopping Cart if there's none assigned
 * Then adds an item
 */
exports.read = function(req, res) {

  let affiliate = req.store.affiliate

  getHashtagsByInstagram(affiliate)
    .then((res_instagramArray)=> {
      return getAssetsByHashtagAndAffiliateId(res_instagramArray, affiliate.id)
    })
    .then((res_instagramAssetsArray)=> {
      return incrementAssetViewCount(res_instagramAssetsArray)
    })
    .then((res_instagramAssetsArray) => {
      res.jsonp(res_instagramAssetsArray)
    })
    .catch((err) => {
      console.log(err)
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
        let response = []
        async.each(bodyJson.data, (post, callback) => {
          if(post.tags.length > 0) {
            response.push({
              tags: post.tags,
              overviewImgUrl: post.images.standard_resolution.url
            })
          }
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

function incrementAssetViewCount(instagramArray) {
  return new Promise ((resolve, reject) => {
    async.each(instagramArray, (instagram, callback) => {  
        
        let assets = instagram.assets   

        async.each(assets, (asset, callback2) => {
          // console.log(asset)
          Asset.findByIdAndUpdate(asset._id, { $inc: { views: 1 }}, { }, function(err, asset) {
            callback2(err)
            // All done dont need to do anything
          })

        }, (err) => {
          if(err) callback(err)
          resolve(instagramArray)
        })
    }, (err) => {
      if (err) reject(err)
      else resolve(instagramArray)
    })
  })
  // console.log(instagramAssets)
}



// Find Assets by hashtag and returns to client in array
function getAssetsByHashtagAndAffiliateId(instagramArray, affiliateId) {

  return new Promise ((resolve, reject) => {
    let response = []
    async.eachOf(instagramArray, (instagram, key, callback) => {  
        let tags = instagram.tags   
        Hashtag.find({name: {$in: tags }, affiliate: affiliateId }).populate('asset').exec(function(err, res_hashtags) {
          if(err) callback(err)

          if(res_hashtags.length > 0) {
            response.push(instagram)
            let responseLastIndex = response.length - 1
            response[responseLastIndex].assets = []
            for(var i = 0; i < res_hashtags.length; i++) {
              if(!res_hashtags[i].asset) break
              response[responseLastIndex].assets.push(res_hashtags[i].asset)
              delete response[responseLastIndex].tags
            }
          } else {
            response.splice(responseLastIndex, 1)
          }
          callback(err)
        })
    }, (err) => {
      if (err) {
        reject(err)
      } else {
        resolve(response)
      }
    })
  })
}