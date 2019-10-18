'use strict';

/**
 * Module dependencies
 */
const path = require('path')
const shopifiesPolicy = require('../policies/shopifies.server.policy')
const shopifies = require('../controllers/shopifies.server.controller')
const Eth = require(path.resolve('./modules/eth/server/controllers/eth.server.controller'))
const UsersAuthCont = require(path.resolve('./modules/users/server/controllers/users/users.authorization.server.controller.js'))
const OrdersCont = require('../../../orders/server/controllers/orders.server.controller.js')

module.exports = function(app) {
  // Shopifies Routes
  app.route('/api/shopifies').post(UsersAuthCont.mockUser, shopifies.create)

  app.route('/api/shopifies/:shopName').get(shopifies.read)

  app.route('/api/shopifies.angjs').all(shopifiesPolicy.isAllowed)
    .get(shopifies.list)
    .put(shopifies.update)

  app.route('/api/shopifies/item-bought')
  .post(UsersAuthCont.mockUser, shopifies.itemBought, UsersAuthCont.getWalletPassword, Eth.unlockAccount, OrdersCont.create);

  app.route('/api/shopifies.angjs/:shopifyId').all(shopifiesPolicy.isAllowed)
    .get(shopifies.read)
    .delete(shopifies.delete)

  app.route('/api/shopifies/:shopifyId/pull').all(shopifiesPolicy.isAllowed)
    .get(shopifies.pullShopify);

  app.route('/api/shopifies/:shopifyId/push').all(shopifiesPolicy.isAllowed)
    .post(UsersAuthCont.getWalletPassword, Eth.unlockAccount, shopifies.pushBlockchain);


  
  // Finish by binding the Shopify middleware
  app.param('shopifyId', shopifies.shopifyByID)
  app.param('shopName', shopifies.shopifyByShopName)
};
