'use strict';

/**
 * Module dependencies
 */
var reputationsPolicy = require('../policies/reputations.server.policy'),
  reputations = require('../controllers/reputations.server.controller');

module.exports = function(app) {
  // Reputations Routes
  app.route('/api/reputations').all(reputationsPolicy.isAllowed)
    .get(reputations.list)
    .post(reputations.create);

  app.route('/api/reputations/:reputationId').all(reputationsPolicy.isAllowed)
    .get(reputations.read)
    .put(reputations.update)
    .delete(reputations.delete);

  // Finish by binding the Reputation middleware
  app.param('reputationId', reputations.reputationByID);
};
