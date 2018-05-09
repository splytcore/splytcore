'use strict';

/**
 * Module dependencies
 */
var rewardsPolicy = require('../policies/rewards.server.policy'),
  rewards = require('../controllers/rewards.server.controller');

module.exports = function(app) {
  // Rewards Routes
  app.route('/api/rewards').all(rewardsPolicy.isAllowed)
    .get(rewards.list)
    .post(rewards.create);

  app.route('/api/rewards/:rewardId').all(rewardsPolicy.isAllowed)
    .get(rewards.read)
    .put(rewards.update)
    .delete(rewards.delete);

  // Finish by binding the Reward middleware
  app.param('rewardId', rewards.rewardByID);
};
