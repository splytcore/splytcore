'use strict';

/**
 * Module dependencies
 */
const path = require('path')
const assetsPolicy = require('../policies/assets.server.policy')
const assets = require('../controllers/assets.server.controller')
const core = require(path.resolve('./modules/core/server/controllers/core.server.controller'))
// const Eth = require(path.resolve('./modules/eth/server/controllers/eth.server.controller'))  

console.log(core.paginate)

module.exports = function(app) {
  // assets Routes
  app.route('/api/assets').all(assetsPolicy.isAllowed)
    .get(core.paginate, assets.list)
    .post(assets.create)

  //Upload asset images
  app.route('/api/assets/picture/upload').post(assets.uploadAssetImage)

  app.route('/api/assets/mine').all(assetsPolicy.isAllowed)
    .get(core.paginate, assets.listMyAssets)

  app.route('/api/assets/:assetId').all(assetsPolicy.isAllowed)
    .get(assets.read, assets.incrementView)

  app.route('/api/assets/:assetId').all(assetsPolicy.onlyAssetCreator)
    .put(assets.update)
    .delete(assets.delete)

  // Finish by binding the asset middleware
  app.param('assetId', assets.assetByID)

}
