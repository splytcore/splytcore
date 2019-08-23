'use strict';

/**
 * Module dependencies
 */
var shopifiesPolicy = require('../policies/shopifies.server.policy'),
  shopifies = require('../controllers/shopifies.server.controller');

module.exports = function(app) {
  // Shopifies Routes
  app.route('/api/shopifies').all(shopifiesPolicy.isAllowed)
    .get(shopifies.list)
    .post(shopifies.create);

  app.route('/api/shopifies/:shopifyId').all(shopifiesPolicy.isAllowed)
    .get(shopifies.read)
    .put(shopifies.update)
    .delete(shopifies.delete);

  // Finish by binding the Shopify middleware
  app.param('shopifyId', shopifies.shopifyByID);
};
