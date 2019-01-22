'use strict';

/**
 * Module dependencies
 */
const cartsPolicy = require('../policies/carts.server.policy')
const cartsItems = require('../controllers/carts-items.server.controller')

module.exports = function(app) {
  // Carts Routes
  app.route('/api/cartsitems')
    .get(cartsItems.list)
    .post(cartsItems.create)

  app.route('/api/cartsitems/:cartItemId')
    .get(cartsItems.read)
    .put(cartsItems.update)
    .delete(cartsItems.delete)

  // Finish by binding the Cart middleware
  app.param('cartItemId', cartsItems.cartItemByID)
};
