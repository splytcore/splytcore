'use strict';

/**
 * Module dependencies.
 */
const path = require('path')
const mongoose = require('mongoose')
const Affiliate = mongoose.model('Affiliate')
const Order = mongoose.model('Order')
const errorHandler = require(path.resolve('./modules/core/server/controllers/errors.server.controller'))
const _ = require('lodash')

/**
 * Create a affiliate
 */
exports.create = function(req, res) {
  var affiliate = new Affiliate(req.body);
  affiliate.user = req.user;

  affiliate.save(function(err) {
    if (err) {
      return res.status(400).send({
        message: errorHandler.getErrorMessage(err)
      });
    } else {
      res.jsonp(affiliate);
    }
  });
};

/**
 * Show the current affiliate
 */
exports.read = function(req, res) {
  // convert mongoose document to JSON
  var affiliate = req.affiliate ? req.affiliate.toJSON() : {};

  // Add a custom field to the Article, for determining if the current User is the "owner".
  // NOTE: This field is NOT persisted to the database, since it doesn't exist in the Article model.
  affiliate.isCurrentUserOwner = req.user && affiliate.user && affiliate.user._id.toString() === req.user._id.toString();

  res.jsonp(affiliate);
};

/**
 * Update a affiliate
 */
exports.update = function(req, res) {
  var affiliate = req.affiliate;

  affiliate = _.extend(affiliate, req.body);

  affiliate.save(function(err) {
    if (err) {
      return res.status(400).send({
        message: errorHandler.getErrorMessage(err)
      });
    } else {
      res.jsonp(affiliate);
    }
  });
};

/**
 * Delete an affiliate
 */
exports.delete = function(req, res) {
  var affiliate = req.affiliate;

  affiliate.remove(function(err) {
    if (err) {
      return res.status(400).send({
        message: errorHandler.getErrorMessage(err)
      });
    } else {
      res.jsonp(affiliate);
    }
  });
};

/**
 * List of affiliates
 */
exports.getSales = function(req, res) {

  let q = req.query
  console.log(q)
  let fromDateMilli = parseInt(q.fromDateMilli)
  let thruDateMilli = parseInt(q.thruDateMilli)

  Order.find({ created: { $gt: q.fromDateSeconds, $lt: thruDateMilli } }).sort('-created').populate('user', 'displayName').exec(function(err, orders) {
    if (err) {
      return res.status(400).send({
        message: errorHandler.getErrorMessage(err)
      });
    } else {
      res.jsonp(orders);
    }
  })
}


/**
 * affiliate middleware
 */
exports.affiliateByID = function(req, res, next, id) {

  if (!mongoose.Types.ObjectId.isValid(id)) {
    return res.status(400).send({
      message: 'affiliate is invalid'
    });
  }

  Affiliate.findById(id).populate('user', 'displayName').exec(function (err, affiliate) {
    if (err) {
      return next(err);
    } else if (!affiliate) {
      return res.status(404).send({
        message: 'No affiliate with that identifier has been found'
      });
    }
    req.affiliate = affiliate;
    next();
  });
};
