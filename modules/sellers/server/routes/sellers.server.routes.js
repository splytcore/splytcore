'use strict';

/**
 * Module dependencies
 */
var sellersPolicy = require('../policies/sellers.server.policy'),
  sellers = require('../controllers/sellers.server.controller');

module.exports = function(app) {
  // Sellers Routes
  app.route('/api/sellers').all(sellersPolicy.isAllowed)
    .get(sellers.list)
    .post(sellers.create);

  app.route('/api/sellers/:sellerId').all(sellersPolicy.isAllowed)
    .get(sellers.read)
    .put(sellers.update)
    .delete(sellers.delete);

  // Finish by binding the Seller middleware
  app.param('sellerId', sellers.sellerByID);
};
