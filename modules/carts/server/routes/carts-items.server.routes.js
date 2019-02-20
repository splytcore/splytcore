'use strict';

/**
 * Module dependencies
 */
const path = require('path')
const cartsPolicy = require('../policies/carts.server.policy')
const cartsItems = require('../controllers/carts-items.server.controller')
const assets = require(path.resolve('./modules/assets/server/controllers/assets.server.controller'))

module.exports = function(app) {
  // Carts Routes
  app.route('/api/cartsitems')
    .get(cartsItems.list)
    .post(cartsItems.create)

  app.route('/api/instagram/:storeId')
    .get(cartsItems.getInstagramAssets)

  app.route('/api/cartsitems/:cartItemId')
    .get(cartsItems.read)
    .put(cartsItems.update)
    .delete(cartsItems.delete)

  // Finish by binding the Cart middleware
  app.param('cartItemId', cartsItems.cartItemByID)
};
