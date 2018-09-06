'use strict';

/**
 * Module dependencies
 */
var arbitrationsPolicy = require('../policies/arbitrations.server.policy'),
  arbitrations = require('../controllers/arbitrations.server.controller');

module.exports = function(app) {
  // Arbitrations Routes
  app.route('/api/arbitrations').all(arbitrationsPolicy.isAllowed)
    .get(arbitrations.list)
    .post(arbitrations.create);

  app.route('/api/arbitrations/:arbitrationId').all(arbitrationsPolicy.isAllowed)
    .get(arbitrations.read)
    .put(arbitrations.update)
    .delete(arbitrations.delete);

  // Finish by binding the Arbitration middleware
  app.param('arbitrationId', arbitrations.arbitrationByID);
};
