'use strict';

/**
 * Module dependencies
 */
const cartsPolicy = require('../policies/carts.server.policy')
const carts = require('../controllers/carts.server.controller')

module.exports = function(app) {
  // Carts Routes
  app.route('/api/carts')
    .get(carts.list)
    .post(carts.create);

  app.route('/api/carts/:cartId')
    .get(carts.read)
    .put(carts.update)
    .delete(carts.delete);

  // Finish by binding the Cart middleware
  app.param('cartId', carts.cartByID);
};
