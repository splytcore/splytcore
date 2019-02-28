'use strict';

/**
 * Module dependencies
 */
const path = require('path')
const ordersPolicy = require('../policies/orders.server.policy')
const orders = require('../controllers/orders.server.controller')
const Eth = require(path.resolve('./modules/eth/server/controllers/eth.server.controller'))
const assets = require(path.resolve('./modules/assets/server/controllers/assets.server.controller'))

module.exports = function(app) {
  // Orders Routes
  app.route('/api/orders').all(ordersPolicy.isAllowed)
    .get(orders.list)

    // comment out for dev
    .post(orders.create, orders.charge, orders.sendOrderNotificationsToParticipants, assets.incrementBuy);

  app.route('/api/orders/:orderId').all(ordersPolicy.isAllowed)
    .get(orders.read)
    .put(orders.update)
    .delete(orders.delete);

  // Finish by binding the Order middleware
  app.param('orderId', orders.orderByID);
};
