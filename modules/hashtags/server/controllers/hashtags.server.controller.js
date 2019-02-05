'use strict';

/**
 * Module dependencies.
 */
var path = require('path'),
  mongoose = require('mongoose'),
  Hashtag = mongoose.model('Hashtag'),
  errorHandler = require(path.resolve('./modules/core/server/controllers/errors.server.controller')),
  _ = require('lodash');

/**
 * Create a Hashtag
 */
exports.create = function(req, res) {
  var hashtag = new Hashtag(req.body);
  hashtag.affiliate = req.user;

  hashtag.save(function(err) {
    if (err) {
      return res.status(400).send({
        message: errorHandler.getErrorMessage(err)
      });
    } else {
      res.jsonp(hashtag);
    }
  });
};

/**
 * Show the current Hashtag
 */
exports.read = function(req, res) {
  // convert mongoose document to JSON
  var hashtag = req.hashtag ? req.hashtag.toJSON() : {};

  // Add a custom field to the Article, for determining if the current User is the "owner".
  // NOTE: This field is NOT persisted to the database, since it doesn't exist in the Article model.
  hashtag.isCurrentUserOwner = req.user && hashtag.affiliate && hashtag.affiliate._id.toString() === req.user._id.toString();

  res.jsonp(hashtag);
};

/**
 * Update a Hashtag
 */
exports.update = function(req, res) {
  var hashtag = req.hashtag;

  hashtag = _.extend(hashtag, req.body);

  hashtag.save(function(err) {
    if (err) {
      return res.status(400).send({
        message: errorHandler.getErrorMessage(err)
      });
    } else {
      res.jsonp(hashtag);
    }
  });
};

/**
 * Delete an Hashtag
 */
exports.delete = function(req, res) {
  var hashtag = req.hashtag;

  hashtag.remove(function(err) {
    if (err) {
      return res.status(400).send({
        message: errorHandler.getErrorMessage(err)
      });
    } else {
      res.jsonp(hashtag);
    }
  });
};

/**
 * List of Hashtags
 */
exports.list = function(req, res) {

  let q = req.query
  
  Hashtag.find(q).sort('-created').populate('affiliate', 'displayName').populate('asset', 'title').exec(function(err, hashtags) {
    if (err) {
      return res.status(400).send({
        message: errorHandler.getErrorMessage(err)
      });
    } else {
      res.jsonp(hashtags);
    }
  });
};

/**
 * Hashtag middleware
 */
exports.hashtagByID = function(req, res, next, id) {

  if (!mongoose.Types.ObjectId.isValid(id)) {
    return res.status(400).send({
      message: 'Hashtag is invalid'
    });
  }

  Hashtag.findById(id).populate('affiliate', 'displayName').populate('asset', 'title').exec(function (err, hashtag) {
    if (err) {
      return next(err);
    } else if (!hashtag) {
      return res.status(404).send({
        message: 'No Hashtag with that identifier has been found'
      });
    }
    req.hashtag = hashtag;
    next();
  });
};
