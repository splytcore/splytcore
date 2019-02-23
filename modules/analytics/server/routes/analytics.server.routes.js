'use strict';

/**
 * Module dependencies
 */
const analyticsPolicy = require('../policies/analytics.server.policy')
const analytics = require('../controllers/analytics.server.controller')

module.exports = function(app) {
  
  app.route('/api/analytics/affiliates/grossSales')
    .get(analytics.getAffiliateGrossSales)

  app.route('/api/analytics/sellers/grossSales')
    .get(analytics.getSellerGrossSales)

  app.route('/api/analytics/sellers/remainingInventory')
    .get(analytics.getSellerRemainingInventory)

  app.route('/api/analytics/sellers/affiliatesLength')
    .get(analytics.getSellerAffiliatesLength)

  app.route('/api/analytics/sellers/salesSummary')
    .get(analytics.getSellerSalesSummary)

  app.route('/api/analytics/topSellingAssets')
    .get(analytics.getTopSellingAssets)

  app.route('/api/analytics/generalSalesSummary').all(analyticsPolicy.isAllowed)
    .get(analytics.getGeneralSalesSummary)

};
