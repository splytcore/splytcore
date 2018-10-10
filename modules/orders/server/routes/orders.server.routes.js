'use strict';

/**
 * Module dependencies
 */
const path = require('path')
const ordersPolicy = require('../policies/orders.server.policy')
const orders = require('../controllers/orders.server.controller')
const Eth = require(path.resolve('./modules/eth/server/controllers/eth.server.controller'))  

module.exports = function(app) {
  // Orders Routes
  app.route('/api/orders')
    .get(orders.list)
    .post(Eth.unlockAccount, orders.create);

  app.route('/api/orders/:orderId/requestRefund')
    .post(orders.requestRefund)

  app.route('/api/orders/:orderId/approveRefund')
    .post(orders.approveRefund)


  app.route('/api/orders/:orderId')
    .get(orders.read)
    .put(orders.update)
    .delete(orders.delete);

  // Finish by binding the Order middleware
  app.param('orderId', orders.orderByID);
};
