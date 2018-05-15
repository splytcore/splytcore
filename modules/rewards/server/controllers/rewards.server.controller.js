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

  let reward = new Reward(req.body);

  // web3.createReward(reward._id)
  //   .then((result) => {
  //     console.log('create reward contract result..' + result)            
  //   })
  //   .catch((err) => {
  //     console.log(err)
  //   })

  
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

  // convert mongoose document to JSON
  var reward = req.reward ? req.reward.toJSON() : {};
  reward.isCurrentUserOwner = req.user && reward.user && reward.user._id.toString() === req.user._id.toString() 
  

  web3.getRewardInfo(reward._id)
    .then((result) => {
      console.log('reward amount' + result.ether)
      console.log('reward address' + result.address)
      console.log('promisor '  + result.promisor)
      console.log('promisee '  + result.promisee)
      console.log('stage '  + result.stage)
      reward.address = result.address
      reward.ether = result.ether
      reward.promisor = result.promisor
      reward.promisee = result.promisee
      reward.stage = result.stage

      res.jsonp(reward)
    })
    .catch((err) => {
      console.log(err)
      return res.status(400).send({
        message: errorHandler.getErrorMessage(err)
      })
    })

}

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

  web3.getRewardsLength()
  .then((result) => {
    console.log('Number of reward contracts...' + result)
  })
  .catch((err) => {
    console.log(err)
  })

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

  Reward.findById(id)
  .populate('user', 'displayName')
  .populate('category')
  .exec(function (err, reward) {

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
