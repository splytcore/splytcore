'use strict';

/**
 * Module dependencies.
 */
const path = require('path')
const mongoose = require('mongoose')
const Stripe = mongoose.model('Stripe')
const errorHandler = require(path.resolve('./modules/core/server/controllers/errors.server.controller'))
const _ = require('lodash')
const stripe = require('stripe')('pk_test_tZPTIhuELHzFYOV3STXQ34dv')
const curl = new (require('curl-request'))()
const userController = require(path.resolve('./modules/users/server/controllers/users/users.profile.server.controller'))

/**
 * Create a Stripe
 */
exports.create = function(req, res) {
  var stripe = new Stripe(req.body);
  stripe.user = req.user;

  stripe.save(function(err) {
    if (err) {
      return res.status(400).send({
        message: errorHandler.getErrorMessage(err)
      });
    } else {
      res.jsonp(stripe);
    }
  });
};

/**
 * Show the current Stripe
 */
exports.read = function(req, res) {
  // convert mongoose document to JSON
  var stripe = req.stripe ? req.stripe.toJSON() : {};

  // Add a custom field to the Article, for determining if the current User is the "owner".
  // NOTE: This field is NOT persisted to the database, since it doesn't exist in the Article model.
  stripe.isCurrentUserOwner = req.user && stripe.user && stripe.user._id.toString() === req.user._id.toString();

  res.jsonp(stripe);
};

/**
 * Update a Stripe
 */
exports.update = function(req, res) {
  var stripe = req.stripe;

  stripe = _.extend(stripe, req.body);

  stripe.save(function(err) {
    if (err) {
      return res.status(400).send({
        message: errorHandler.getErrorMessage(err)
      });
    } else {
      res.jsonp(stripe);
    }
  });
};

/**
 * Delete an Stripe
 */
exports.delete = function(req, res) {
  var stripe = req.stripe;

  stripe.remove(function(err) {
    if (err) {
      return res.status(400).send({
        message: errorHandler.getErrorMessage(err)
      });
    } else {
      res.jsonp(stripe);
    }
  });
};

/**
 * List of Stripes
 */
exports.list = function(req, res) {
  Stripe.find().sort('-created').populate('user', 'displayName').exec(function(err, stripes) {
    if (err) {
      return res.status(400).send({
        message: errorHandler.getErrorMessage(err)
      });
    } else {
      res.jsonp(stripes);
    }
  });
};


exports.saveIgCode = (req, res, next) => {
  console.log(req.body.igCode)
  let clientId = '09156f2dbd264bdb8652cff79b354b36'
  let clientSecret = 'ebde362954ba4ee2814e2778d78ef146'
  let redirectUri = 'http://www.localhost:3000/stripes'

  curl.setHeaders([
    'Content-Type: application/x-www-form-urlencoded'
  ])
  curl.setBody({
    'client_id': clientId,
    'client_secret':clientSecret,
    'grant_type':'authorization_code',
    'redirect_uri':redirectUri,
    'code': req.body.igCode
  }).post('https://api.instagram.com/oauth/access_token').then(({statusCode, body, headers}) => {
    if(statusCode = 200) {
      let igInfo = JSON.parse(body)
      console.log(igInfo)
      req.body.igAccessToken = igInfo.access_token
      req.body.profileImageURL = igInfo.user.profile_picture
      req.body.firstName = igInfo.user.full_name
      next()
    }
  }).catch(e => {
    console.log(e)
    next()
  })
}

/**
 * Stripe middleware
 */
exports.stripeByID = function(req, res, next, id) {

  if (!mongoose.Types.ObjectId.isValid(id)) {
    return res.status(400).send({
      message: 'Stripe is invalid'
    });
  }

  Stripe.findById(id).populate('user', 'displayName').exec(function (err, stripe) {
    if (err) {
      return next(err);
    } else if (!stripe) {
      return res.status(404).send({
        message: 'No Stripe with that identifier has been found'
      });
    }
    req.stripe = stripe;
    next();
  });
};
