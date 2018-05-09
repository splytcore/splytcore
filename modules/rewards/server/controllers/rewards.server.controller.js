'use strict';

/**
 * Module dependencies.
 */
var path = require('path'),
  mongoose = require('mongoose'),
  Reward = mongoose.model('Reward'),
  errorHandler = require(path.resolve('./modules/core/server/controllers/errors.server.controller')),
  web3 = require(path.resolve('./modules/rewards/server/services/rewards.server.service')),
  _ = require('lodash');

/**
 * Create a Reward
 */
exports.create = function(req, res) {
  var reward = new Reward(req.body);
  reward.user = req.user;

  reward.save(function(err) {
    if (err) {
      return res.status(400).send({
        message: errorHandler.getErrorMessage(err)
      });
    } else {
      res.jsonp(reward);
    }
  });
};

/**
 * Show the current Reward
 */
exports.read = function(req, res) {

  web3.test()
  .then((result) => {
    console.log(result)
  })
  .catch((err) => {
    console.log(err)
  })

  // convert mongoose document to JSON
  var reward = req.reward ? req.reward.toJSON() : {};

  // Add a custom field to the Article, for determining if the current User is the "owner".
  // NOTE: This field is NOT persisted to the database, since it doesn't exist in the Article model.
  reward.isCurrentUserOwner = req.user && reward.user && reward.user._id.toString() === req.user._id.toString();

  res.jsonp(reward);
};

/**
 * Update a Reward
 */
exports.update = function(req, res) {
  var reward = req.reward;

  reward = _.extend(reward, req.body);

  reward.save(function(err) {
    if (err) {
      return res.status(400).send({
        message: errorHandler.getErrorMessage(err)
      });
    } else {
      res.jsonp(reward);
    }
  });
};

/**
 * Delete an Reward
 */
exports.delete = function(req, res) {
  var reward = req.reward;

  reward.remove(function(err) {
    if (err) {
      return res.status(400).send({
        message: errorHandler.getErrorMessage(err)
      });
    } else {
      res.jsonp(reward);
    }
  });
};

/**
 * List of Rewards
 */
exports.list = function(req, res) {
  Reward.find().sort('-created').populate('user', 'displayName').exec(function(err, rewards) {
    if (err) {
      return res.status(400).send({
        message: errorHandler.getErrorMessage(err)
      });
    } else {
      res.jsonp(rewards);
    }
  });
};

/**
 * Reward middleware
 */
exports.rewardByID = function(req, res, next, id) {

  if (!mongoose.Types.ObjectId.isValid(id)) {
    return res.status(400).send({
      message: 'Reward is invalid'
    });
  }

  Reward.findById(id).populate('user', 'displayName').exec(function (err, reward) {
    if (err) {
      return next(err);
    } else if (!reward) {
      return res.status(404).send({
        message: 'No Reward with that identifier has been found'
      });
    }
    req.reward = reward;
    next();
  });
};
