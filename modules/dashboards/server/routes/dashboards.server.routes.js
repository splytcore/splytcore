'use strict';

/**
 * Module dependencies
 */
var dashboardsPolicy = require('../policies/dashboards.server.policy'),
  dashboards = require('../controllers/dashboards.server.controller');

module.exports = function(app) {
  // Dashboards Routes
  app.route('/api/dashboards').all(dashboardsPolicy.isAllowed)
    .get(dashboards.list)
    .post(dashboards.create);

  app.route('/api/dashboards/:dashboardId').all(dashboardsPolicy.isAllowed)
    .get(dashboards.read)
    .put(dashboards.update)
    .delete(dashboards.delete);

  // Finish by binding the Dashboard middleware
  app.param('dashboardId', dashboards.dashboardByID);
};
