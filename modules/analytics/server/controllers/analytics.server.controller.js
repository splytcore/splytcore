'use strict';

/**
 * Module dependencies.
 */
const path = require('path')
const mongoose = require('mongoose')
const async = require('async')

const Analytic = mongoose.model('Analytic')
const Asset = mongoose.model('Asset')
const Order = mongoose.model('Order')
const Store = mongoose.model('Store')
const User = mongoose.model('User')
const Hashtag = mongoose.model('Hashtag')
const StoreAsset = mongoose.model('StoreAsset')
const TopSellers = mongoose.model('TopSellers')
const SellerSalesSummary = mongoose.model('SellerSalesSummary')

const OrderItem = mongoose.model('OrderItem')

const errorHandler = require(path.resolve('./modules/core/server/controllers/errors.server.controller'))
const _ = require('lodash')

mongoose.Promise = Promise


exports.getUsersByRole = function(req, res) {

  let role = req.query.role

  User.find({ roles: role }).select('displayName email').exec()
    .then((users) => {
      res.jsonp(users)
    })
    .catch((err) => {
      return res.status(400).send({
        message: err.toString()
      })      
    })
}

/* 
* Get Sales from date to thru day by milliseconds
*/

exports.getAffiliateGrossSales = function(req, res) {

  let q = req.query
  console.log(q)
  
  let fromDateMS = q.fromDateMS ? parseInt(q.fromDateMS) : 0
  let thruDateMS = q.thruDateMS ? parseInt(q.thruDateMS) : (new Date()).getTime()

  let userId = q.userId

  //for testing
  // fromDateMS = 0
  // thruDateMS = (new Date()).getTime()

  // userId = '5bae85c096985d1167289d9c'

  let grossSales = 0
  let totalQuantity = 0
  let totalReward = 0


  Store.find({ affiliate: userId }).exec()
    .then((stores) => {
      if (!stores) {
        return Promise.reject(new Error('No stores found for this affiliate Id ' + userId))
      } 
      return new Promise((resolve, reject) => {
        let allItems = []
        async.each(stores, (store, cb) => {
          OrderItem.find({ store: store._id, created: { $gte: fromDateMS, $lte: thruDateMS } }).populate('asset').exec((err, res_items) => {
           allItems = allItems.concat(res_items)
            cb(err)
          })
        }, (err) => {
          if (err) {
            reject(err)
          } else {
            resolve(allItems)
          }
        })  
      })
    })
    .then((items) => {
      if (!items) {
        return Promise.resolve()
      }
      return new Promise((resolve, reject) => {
        items.forEach((i) => {
          grossSales += (i.soldPrice * i.quantity)
          totalQuantity += i.quantity
          totalReward += i.reward
        })
        resolve()
      })
    })
    .then(() => {
      totalReward = (totalReward * 20) / 100 
      res.jsonp({ affiliateId: userId, grossSales: grossSales, totalQuantity: totalQuantity, totalReward: totalReward })
    })
    .catch((err) => {
      console.log(err)
      return res.status(400).send({
        message: err.toString()
      })
    })
}

/* 
* Get Sales from date to thru day by milliseconds
*/

exports.getSellerGrossSales = function(req, res) {

  let q = req.query
  console.log(q)
  
  let fromDateMS = q.fromDateMS ? parseInt(q.fromDateMS) : 0
  let thruDateMS = q.thruDateMS ? parseInt(q.thruDateMS) : (new Date()).getTime()

  let userId = q.userId

  // for testing
  // fromDateMS = 0
  // thruDateMS = (new Date()).getTime()

  // userId = '5c5a2fdc67f728159b3c7ea5'

  let grossSales = 0
  let totalQuantity = 0

  OrderItem.find({ seller: userId, created: { $gte: fromDateMS, $lte: thruDateMS } }).populate('asset').exec()
    .then((items) => {
      return new Promise((resolve, reject) => {
        if (items) {
          items.forEach((i) => {
            grossSales += i.soldPrice * i.quantity
            totalQuantity += i.quantity
          })
          resolve()
        } else {
          resolve()
        }
      })
    })
    .then(() => {
      res.jsonp({ sellerId: userId, grossSales: grossSales, totalQuantity: totalQuantity })
    })
    .catch((err) => {
      console.log(err)
      return res.status(400).send({
        message: err.toString()
      })
    })
}

/* 
* Get sellers remaining inventory and value
*/

exports.getSellerRemainingInventory = function(req, res) {

  let q = req.query
  console.log(q)

  let userId = q.userId

  let remainingInventoryValue = 0
  let remainingInventoryCount = 0

  Asset.find({ user: userId }).exec()
    .then((assets) => {
      if (assets) {
        remainingInventoryValue = assets.reduce((total, asset) => total + asset.inventoryCount * asset.price, 0)
        remainingInventoryCount =  assets.reduce((total, asset) => total + asset.inventoryCount, 0)    
      } 
      return
    })
    .then(() => {
      res.jsonp({ sellerId: userId, remainingInventoryValue: remainingInventoryValue, remainingInventoryCount: remainingInventoryCount })
    })
    .catch((err) => {
      console.log(err)
      return res.status(400).send({
        message: err.toString()
      })
    })
}

/* 
* Get total number of affiliates whos selling they're asset
*/

exports.getSellerAffiliatesLength = function(req, res) {

  let q = req.query
  console.log(q)

  let userId = q.userId

  if (!mongoose.Types.ObjectId.isValid(userId)) {
    return res.status(400).send({
      message: 'userId is invalid'
    })
  }
  
  let affiliates = new Set()

  Asset.find({ user: userId }).populate('user').exec()
    .then((assets) => {    
      async.each(assets, (asset, callback) => {
        StoreAsset.find({ asset: asset.id }).deepPopulate('store.affiliate').exec((err, storeAssets) => {
          if (storeAssets.length > 0) {
            let affiliateIds = storeAssets.map((storeAsset) => storeAsset.store.affiliate.id)
            affiliateIds.forEach((id) => affiliates.add(id))
          }
          callback()
        })
      }, (err) => {
        if (err) {
          return Promise.reject(err)
        } else {
          res.jsonp({ sellerId: userId, totalNumberAffiliates: affiliates.size })
        }
      })
    })
    .catch((err) => {
      console.log(err)
      return res.status(400).send({
        message: err.toString()
      })
    })

}
/* 
* Get top selling assets from and thru date with limit\
* TODO: delete records after generating report
*/
exports.getTopSellingAssets = function(req, res) {

  let q = req.query
  console.log(q)

  let fromDateMS = q.fromDateMS ? parseInt(q.fromDateMS) : 0
  let thruDateMS = q.thruDateMS ? parseInt(q.thruDateMS) : (new Date()).getTime()

  let limit = q.limit ? parseInt(q.limit) : 10 //default 10

  // for testing
  // fromDateMS = 0
  // thruDateMS = (new Date()).getTime()

  let reportId = (new Date()).getTime()

  OrderItem.find({ created: { $gte: fromDateMS, $lte: thruDateMS }}).populate('order').populate('asset').exec()
    .then((orderItems) => {
      if (!orderItems) {
        return
      }
      async.each(orderItems, (item, cb) => {
        TopSellers.findOneAndUpdate({ reportId: reportId, asset: item.asset.id }, {$inc: { quantity: item.quantity }}, { upsert: true }).exec((err, result) => {
          cb(err)
        })        
      }, (err) => {
        if (err) {
          return Promise.reject(err)
        } else {
          return
        }
      })
    })
    .then(() => { 
      TopSellers.find({ reportId: reportId }, '-reportId -_id -created').sort('-quantity').populate('asset', 'title').limit(limit).exec((err, result) => {
        if (err) {
          return Promise.reject(err)
        }
        res.jsonp(result)
      })
    })
    .catch((err) => {
      console.log(err)
      return res.status(400).send({
        message: err.toString()
      })
    })
}

/* 
* Get sellers sales summary 

*/
exports.getSellerSalesSummary = function(req, res) {

  let q = req.query
  console.log(q)

  let limit = q.limit ? parseInt(q.limit) : 10 //default 10
  let userId = q.userId
  let reportId = (new Date()).getTime()

  OrderItem.find({ seller: userId }).populate('order').populate('asset').exec()
    .then((orderItems) => {
      if (!orderItems) {
        return Promise.reject('No orders for seller found')
      } 
      return new Promise((resolve, reject) => {
        async.each(orderItems, (item, cb) => {
          SellerSalesSummary.findOneAndUpdate({ reportId: reportId, asset: item.asset.id }, {$inc: { quantity: item.quantity, sales: item.quantity * item.price }, hashtag: item.hashtag }, { upsert: true }).exec((err, result) => {
            cb(err)
          })        
        }, (err) => {
          if (err) {
            reject(err)
          } else {
            resolve()
          }
        })
      })
    })
    .then(() => { 
      SellerSalesSummary.find({ reportId: reportId }, '-reportId -_id -created').sort('-sales').populate('asset', 'title').populate('hashtag', 'name').limit(limit).exec((err, result) => {
        if (err) {
          return Promise.reject(err)
        }
        res.jsonp(result)
      })
    })
    .catch((err) => {
      console.log(err)
      return res.status(400).send({
        message: err.toString()
      })
    })
}

/* 
* Get sellers sales summary 
* Total Gross Sales from begining
* Total number of orders

* Total number assets
* Total number of Sellers
* Total number of Affiliates
* Total commission
* Total commissions
*/
exports.getGeneralSalesSummary = function(req, res) {

  // let q = req.query

  let totalGrossSales = 0
  let totalSellers = 0
  let totalQuantity = 0
  let totalAffiliates = 0
  let totalStoreViews = 0
  let totalHashtags = 0

  let totalRewards = 0 //total commission  
  let totalAffiliatesCommission = 0 //total reward * .20
  let totalPollenyCommission = 0 //total commssion for 

  let totalOrders = 0
  let totalAssets = 0

  let totalViews = 0
  let totalBuys = 0
  let totalViewsBuysPercentage = 0

  OrderItem.find().populate('order').populate('asset').exec()
    .then((orderItems) => {
      if (!orderItems) {
        return Promise.reject('No orders for seller found')
      }
      return new Promise((resolve, reject) => {
        async.each(orderItems, (item, cb) => {
          totalGrossSales += item.soldPrice * item.quantity
          totalQuantity += item.quantity
          totalRewards += item.reward
          // totalViews += item.asset.views
          // totalBuys += item.asset.buys
          cb()
        }, (err) => {
          if (err) {
            reject(err)
          } else {
            resolve()
          }
        })
      })
    })
    .then(() => { 
      return Order.count().exec()
    })
    .then(ordersLength => {
      totalOrders = ordersLength 
      return Asset.count().exec()
    })
    .then(assetsLength => {
      totalAssets = assetsLength
      return User.count({ roles: 'seller' }).exec()
    })
    .then(sellersLength => { 
      totalSellers = sellersLength
      return User.count({ roles: 'affiliate' }).exec()
    })
    .then(affiliatesLength => {
      totalAffiliates = affiliatesLength
      return findStoreViews()
    })
    .then(storeViews => {
      totalStoreViews = storeViews
      return Hashtag.count().exec()
    })
    .then(totalHashtags => { 
      totalHashtags = totalHashtags
      totalViewsBuysPercentage = (totalOrders / totalStoreViews) * 100
      res.jsonp({ 
        totalGrossSales: totalGrossSales, 
        totalSellers: totalSellers, 
        totalQuantity: totalQuantity, 
        totalAffiliates: totalAffiliates, 
        totalRewards: totalRewards,
        totalOrders: totalOrders,
        totalAssets: totalAssets,
        totalStoreViews: totalStoreViews,
        totalViewsBuysPercentage: totalViewsBuysPercentage,
        totalAffiliatesCommission: (totalRewards * 80) / 100 ,
        totalPollenlyCommission: (totalRewards * 20) / 100,
        totalHashtags: totalHashtags
      })
    })
    .catch((err) => {
      console.log(err)
      return res.status(400).send({
        message: err.toString()
      })
    })

    function findStoreViews() {
      return new Promise(function (resolve, reject) {
        Store.find({ views: { $gt: 0 }}).exec((err, stores) => {
          let storeViews = 0
          async.each(stores, (store, cb) => {
            storeViews += store.views
            cb(err)
          }, err => {
            if(err) return reject(err)
            resolve(storeViews)
          })
        })
      })
    }

  }

