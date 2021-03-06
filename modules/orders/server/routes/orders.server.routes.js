'use strict';

/**
 * Module dependencies
 */
const ordersPolicy = require('../policies/orders.server.policy')
const orders = require('../controllers/orders.server.controller')
const Eth = require('../../../eth/server/controllers/eth.server.controller')
const UsersAuthCont = require('../../../users/server/controllers/users/users.authorization.server.controller.js')


module.exports = function(app) {
  // Orders Routes
  app.route('/api/orders').all(ordersPolicy.isAllowed)
    .get(orders.list)
    .post(UsersAuthCont.getWalletPassword, Eth.unlockAccount, orders.create)

  app.route('/api/orders/:orderId/requestRefund').all(ordersPolicy.isAllowed)
    .post(orders.requestRefund)

  app.route('/api/orders/:orderId/approveRefund').all(ordersPolicy.isAllowed)
    .post(orders.approveRefund)

  //app.route('/api/orders/hello').post(orders.postOrderProcess)
  app.route('/api/orders/:orderId').all(ordersPolicy.isAllowed)
    .get(orders.read)
    .put(orders.update)
    .delete(orders.delete)

  // Finish by binding the Order middleware
  app.param('orderId', orders.orderByID)
}
