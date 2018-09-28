'use strict';

/**
 * Module dependencies
 */
const path = require('path')
const arbitrationsPolicy = require('../policies/arbitrations.server.policy')
const arbitrations = require('../controllers/arbitrations.server.controller')
const Eth = require(path.resolve('./modules/eth/server/controllers/eth.server.controller'))  

module.exports = function(app) {
  // Arbitrations Routes
  app.route('/api/arbitrations').all(arbitrationsPolicy.isAllowed)
    .get(arbitrations.list)
    .post(Eth.unlockAccount, arbitrations.create);

  app.route('/api/arbitrations/:arbitrationId').all(arbitrationsPolicy.isAllowed)
    .get(arbitrations.read)
    .put(arbitrations.update)
    .delete(arbitrations.delete);

  // Finish by binding the Arbitration middleware
  app.param('arbitrationId', arbitrations.arbitrationByID);
};
