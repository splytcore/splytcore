'use strict';

/**
 * Module dependencies
 */
const assetsPolicy = require('../policies/assets.server.policy')
const assets = require('../controllers/assets.server.controller')
const path = require('path')
const Eth = require(path.resolve('./modules/eth/server/controllers/eth.server.controller'))
const UsersAuthCont = require(path.resolve('./modules/users/server/controllers/users/users.authorization.server.controller.js'))


module.exports = function(app) {
  // assets Routes
  app.route('/api/assets').get(assets.getAllAssetsFromContract, assets.bindTitleAndDescription, assets.list)

  app.route('/api/assets').all(assetsPolicy.isAllowed)
    .post(UsersAuthCont.getWalletPassword, Eth.unlockAccount, assets.create)

  app.route('/api/assetByAddress/:assetAddress').all(assetsPolicy.isAllowed)
    .get(assets.returnAsset)

  app.route('/api/assets/:assetId').all(assetsPolicy.isAllowed)
    .get(assets.read, assets.bindMarketPlaces)
    .put(assets.update)
    .delete(assets.delete)

  // Finish by binding the asset middleware
  app.param('assetId', assets.assetByID)
  app.param('assetAddress', assets.getAssetByAddress)

}
