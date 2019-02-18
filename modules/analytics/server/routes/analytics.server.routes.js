'use strict';

/**
 * Module dependencies
 */
const analyticsPolicy = require('../policies/analytics.server.policy')
const analytics = require('../controllers/analytics.server.controller')

module.exports = function(app) {
  // Analytics Routes
  // app.route('/api/analytics').all(analyticsPolicy.isAllowed)
  //   .get(analytics.list)
  //   .post(analytics.create);

  app.route('/api/analytics/affiliates/grossSales')
    .get(analytics.getAffiliateGrossSales)

  app.route('/api/analytics/sellers/grossSales')
    .get(analytics.getSellerGrossSales)

  app.route('/api/analytics/sellers/remainingInventory')
    .get(analytics.getSellerRemainingInventory)

  app.route('/api/analytics/sellers/affiliatesLength')
    .get(analytics.getSellerAffiliatesLength)

  app.route('/api/analytics/topSellingAssets')
    .get(analytics.getTopSellingAssets)


  // app.route('/api/analytics/:analyticId').all(analyticsPolicy.isAllowed)
  //   .get(analytics.read)
  //   .put(analytics.update)
  //   .delete(analytics.delete);

  // Finish by binding the Analytic middleware
  // app.param('analyticId', analytics.analyticByID);
};
