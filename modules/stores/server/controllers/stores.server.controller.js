'use strict';

/**
 * Module dependencies.
 */
const path = require('path')
const mongoose = require('mongoose')
const Store = mongoose.model('Store')
const StoreAsset = mongoose.model('StoreAsset')
const Hashtag = mongoose.model('Hashtag')

const errorHandler = require(path.resolve('./modules/core/server/controllers/errors.server.controller'))
const _ = require('lodash')
const async = require('async')


/**
 * Create/update a Store if it doesn't exist by affiliateId
 */
exports.create = function(req, res) {

  let affiliateId = req.user.id

  Store.findOneAndUpdate({ affiliate: req.user.id }, req.body, { new: true, upsert:true }, (err, store) => {
    if (err) {
      console.log(err)
      return res.status(400).send({
        message: errorHandler.getErrorMessage(err)
      })
    } else {
      // console.log(cartItem)
      res.jsonp(store)
    }
  })

}

/**
 * Show the current Store
 */
exports.read = function(req, res) {
  // convert mongoose document to JSON
  let store = req.store ? req.store.toJSON() : {};
  
  console.log('store')
  console.log(store.affiliate.id)

  StoreAsset.find({ store: store._id }, {}, req.paginate).populate('asset').populate('affiliate').exec(function(err, storeAssets) {
    if (err) {
      return res.status(400).send({
        message: errorHandler.getErrorMessage(err)
      });
    } else {
      // console.log(storeAssets)
      // console.log('length: ' + storeAssets.length)
      let response

      async.each(storeAssets, (storeAsset, callback) => {
        let newStoreAsset

        if (storeAsset.asset && store.affiliate) {
          Hashtag.findOne({ asset: storeAsset.asset._id, affiliate: store.affiliate._id}).exec((err, hashtag) => {
            // console.log(hashtag)
            if(hashtag) {
              let asset = {}
              asset = _.extend(asset, storeAsset.asset)
              delete asset.hashtags
              asset.hashtags = []
              asset.hashtags.push(hashtag)
              storeAsset.asset = asset
              callback()
            } else {
              callback()
            }
          })
        } else {
          callback()
        } 
      }, err => {
        if(err) {
          return res.status(400).send({
            message: errorHandler.getErrorMessage(err)
          })
        } else {
          store.storeAssets = storeAssets
          res.jsonp(store);
        }
        
      })
      
    }
  });

}

/**
 * Update a Store
 */
exports.update = function(req, res) {
  var store = req.store;

  store = _.extend(store, req.body);

  store.save(function(err) {
    if (err) {
      return res.status(400).send({
        message: errorHandler.getErrorMessage(err)
      });
    } else {
      res.jsonp(store);
    }
  });
};

/**
 * Delete an Store
 */
exports.delete = function(req, res) {
  var store = req.store;

  store.remove(function(err) {
    if (err) {
      return res.status(400).send({
        message: errorHandler.getErrorMessage(err)
      });
    } else {
      res.jsonp(store);
    }
  });
};

/**
 * List of Stores
 */
exports.list = function(req, res) {
  
  let q = req.query
  let sort = req.sort
  delete q.sort

  Store.find(q).sort(sort).populate('affiliate', 'displayName profileImageURL').exec(function(err, stores) {
    if (err) {
      return res.status(400).send({
        message: errorHandler.getErrorMessage(err)
      });
    } else {
      res.jsonp(stores);
    }
  });
}

exports.listByName = function(req, res) {

  Store.findOne(req.params).sort('-created').populate('affiliate', 'displayName profileImageURL').exec((err, store) => {
    if(err) {
      return res.status(400).send({
        message: errorHandler.getErrorMessage(err)
      })
    }
    res.jsonp(store)
  })
}

/**
 * Store middleware
 */
exports.storeByID = function(req, res, next, id) {

  console.log('middlware get store')
  if (!mongoose.Types.ObjectId.isValid(id)) {
    return res.status(400).send({
      message: 'Store is invalid'
    });
  }

  Store.findById(id).populate('affiliate', 'displayName').populate('affiliate', '-password -salt').populate('categories').exec(function (err, store) {
    if (err) {
      return next(err);
    } else if (!store) {
      return res.status(404).send({
        message: 'No Store with that identifier has been found'
      });
    }
    req.store = store;
    next();
  });
};
