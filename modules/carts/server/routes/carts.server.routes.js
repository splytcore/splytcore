'use strict';

/**
 * Module dependencies
 */
var cartsPolicy = require('../policies/carts.server.policy'),
  carts = require('../controllers/carts.server.controller');

module.exports = function(app) {
  // Carts Routes
  app.route('/api/carts').all(cartsPolicy.isAllowed)
    .get(carts.list)
    .post(carts.create);

  app.route('/api/carts/:cartId').all(cartsPolicy.isAllowed)
    .get(carts.read)
    .put(carts.update)
    .delete(carts.delete);

  // Finish by binding the Cart middleware
  app.param('cartId', carts.cartByID);
};
