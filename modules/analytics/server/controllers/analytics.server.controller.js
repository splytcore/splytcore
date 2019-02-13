'use strict';

/**
 * Module dependencies.
 */
const path = require('path')
const mongoose = require('mongoose')
const Analytic = mongoose.model('Analytic')
const Order = mongoose.model('Order')
const Store = mongoose.model('Store')
const OrderItem = mongoose.model('OrderItem')

const errorHandler = require(path.resolve('./modules/core/server/controllers/errors.server.controller'))
const _ = require('lodash')

mongoose.Promise = Promise

/**
 * Create a Analytic
 */
exports.create = function(req, res) {
  var analytic = new Analytic(req.body);
  analytic.user = req.user;

  analytic.save(function(err) {
    if (err) {
      return res.status(400).send({
        message: errorHandler.getErrorMessage(err)
      });
    } else {
      res.jsonp(analytic);
    }
  });
};

/**
 * Show the current Analytic
 */
exports.read = function(req, res) {
  // convert mongoose document to JSON
  var analytic = req.analytic ? req.analytic.toJSON() : {};

  // Add a custom field to the Article, for determining if the current User is the "owner".
  // NOTE: This field is NOT persisted to the database, since it doesn't exist in the Article model.
  analytic.isCurrentUserOwner = req.user && analytic.user && analytic.user._id.toString() === req.user._id.toString();

  res.jsonp(analytic);
};

/**
 * Update a Analytic
 */
exports.update = function(req, res) {
  var analytic = req.analytic;

  analytic = _.extend(analytic, req.body);

  analytic.save(function(err) {
    if (err) {
      return res.status(400).send({
        message: errorHandler.getErrorMessage(err)
      });
    } else {
      res.jsonp(analytic);
    }
  });
};

/**
 * Delete an Analytic
 */
exports.delete = function(req, res) {
  var analytic = req.analytic;

  analytic.remove(function(err) {
    if (err) {
      return res.status(400).send({
        message: errorHandler.getErrorMessage(err)
      });
    } else {
      res.jsonp(analytic);
    }
  });
};

/**
 * List of Analytics
 */
exports.list = function(req, res) {
  Analytic.find().sort('-created').populate('user', 'displayName').exec(function(err, analytics) {
    if (err) {
      return res.status(400).send({
        message: errorHandler.getErrorMessage(err)
      });
    } else {
      res.jsonp(analytics);
    }
  });
};

/* 
* Get Sales from date to thru day by milliseconds
*/

exports.getAffiliateGrossSales = function(req, res) {

  let q = req.query
  console.log(q)
  let fromDateMS = parseInt(q.fromDateMS)
  let thruDateMS = parseInt(q.thruDateMS)

  let userId = q.userId

  //for testing
  // fromDateMS = 0
  // thruDateMS = (new Date()).getTime()

  // userId = '5bae85c096985d1167289d9c'

  let grossSales = 0
  let totalQuantity = 0
  let totalReward = 0


  Store.findOne({ affiliate: userId }).exec()
    .then((store) => {
      // console.log(store)
      if (!store) {
        return Promise.resolve()
      } else {
        return OrderItem.find({ store: store._id, created: { $gte: fromDateMS, $lte: thruDateMS } }).populate('asset').exec()
      }
    })
    .then((items) => {

      if (!items) {
        return
      } else {
        items.forEach((i) => {
          grossSales += (i.asset.price * i.quantity)
          totalQuantity += i.quantity
          totalReward += i.asset.reward
        })
        return
      }

    })
    .then(() => {
      res.jsonp({ affiliateId: userId, grossSales: grossSales, totalQuantity: totalQuantity, totalReward: totalReward})
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
  let fromDateMS = parseInt(q.fromDateMS)
  let thruDateMS = parseInt(q.thruDateMS)

  let userId = q.userId

  // for testing
  // fromDateMS = 0
  // thruDateMS = (new Date()).getTime()

  // userId = '5c5a2fdc67f728159b3c7ea5'

  let grossSales = 0
  let totalQuantity = 0

  OrderItem.find({ seller: userId, created: { $gte: fromDateMS, $lte: thruDateMS } }).populate('asset').exec()
    .then((items) => {
      if (items) {
        items.forEach((i) => {
          grossSales += i.asset.price * i.quantity
          totalQuantity += i.quantity
        })
      } 
      return
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


/**
 * Analytic middleware
 */
exports.analyticByID = function(req, res, next, id) {

  if (!mongoose.Types.ObjectId.isValid(id)) {
    return res.status(400).send({
      message: 'Analytic is invalid'
    });
  }

  Analytic.findById(id).populate('user', 'displayName').exec(function (err, analytic) {
    if (err) {
      return next(err);
    } else if (!analytic) {
      return res.status(404).send({
        message: 'No Analytic with that identifier has been found'
      });
    }
    req.analytic = analytic;
    next();
  });
};
