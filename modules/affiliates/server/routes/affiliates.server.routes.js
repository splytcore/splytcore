'use strict';

/**
 * Module dependencies
 */
var affiliatesPolicy = require('../policies/affiliates.server.policy'),
  affiliates = require('../controllers/affiliates.server.controller');

module.exports = function(app) {
  // Affiliates Routes
  app.route('/api/affiliates').all(affiliatesPolicy.isAllowed)
    .get(affiliates.list)
    .post(affiliates.create);

  app.route('/api/affiliates/:affiliateId').all(affiliatesPolicy.isAllowed)
    .get(affiliates.read)
    .put(affiliates.update)
    .delete(affiliates.delete);

  // Finish by binding the Affiliate middleware
  app.param('affiliateId', affiliates.affiliateByID);
};
