'use strict';

/**
 * Module dependencies
 */
const path = require('path')
const reputationsPolicy = require('../policies/reputations.server.policy')
const reputations = require('../controllers/reputations.server.controller')
const Eth = require(path.resolve('./modules/eth/server/controllers/eth.server.controller'))  

module.exports = function(app) {
  // Reputations Routes
  app.route('/api/reputations').all(reputationsPolicy.isAllowed)
    .get(reputations.list)
    .post(Eth.unlockAccount, reputations.create);

  app.route('/api/reputations/:reputationId').all(reputationsPolicy.isAllowed)
    .get(reputations.read, reputations.bindRateDetail)
    .put(reputations.update)
    .delete(reputations.delete);

  // Finish by binding the Reputation middleware
  app.param('reputationId', reputations.reputationByID);
};
