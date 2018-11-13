'use strict';

/**
 * Module dependencies
 */
const assetsPolicy = require('../policies/assets.server.policy')
const assets = require('../controllers/assets.server.controller')
const path = require('path')
const Eth = require(path.resolve('./modules/eth/server/controllers/eth.server.controller'))  

module.exports = function(app) {
  // assets Routes
  app.route('/api/assets').all(assetsPolicy.isAllowed)
    .get(assets.getAllAssetsFromContract, assets.bindTitleAndDescription, assets.list)
    .post(Eth.unlockAccount, assets.create)

  app.route('/api/assets/:assetId').all(assetsPolicy.isAllowed)
    .get(assets.read, assets.bindMarketPlaces)
    .put(assets.update)
    .delete(assets.delete)

  // Finish by binding the asset middleware
  app.param('assetId', assets.assetByID)
}
