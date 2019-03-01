'use strict';

/**
 * Module dependencies
 */
const path = require('path')
const orderItemsPolicy = require('../policies/order-items.server.policy')
const orderItems = require('../controllers/order-items.server.controller')

module.exports = function(app) {
							
  app.route('/api/orderitems/:orderItemId/shipped').all(orderItemsPolicy.onlySellerOrAdminOfOrderItem)
  	.put(orderItems.shipped)

  // Finish by binding the Order middleware
  app.param('orderItemId', orderItems.orderItemByID)
}