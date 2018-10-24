'use strict';

/**
 * Module dependencies
 */
var analyticsPolicy = require('../policies/analytics.server.policy'),
  analytics = require('../controllers/analytics.server.controller');

module.exports = function(app) {
  // Analytics Routes
  app.route('/api/analytics').all(analyticsPolicy.isAllowed)
    .get(analytics.list)
    .post(analytics.create);

  app.route('/api/analytics/:analyticId').all(analyticsPolicy.isAllowed)
    .get(analytics.read)
    .put(analytics.update)
    .delete(analytics.delete);

  // Finish by binding the Analytic middleware
  app.param('analyticId', analytics.analyticByID);
};
