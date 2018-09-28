'use strict';

/**
 * Module dependencies
 */
var assetsPolicy = require('../policies/assets.server.policy'),
  assets = require('../controllers/assets.server.controller'),
  path = require('path'),
  Eth = require(path.resolve('./modules/eth/server/controllers/eth.server.controller'))  

module.exports = function(app) {
  // assets Routes
  app.route('/api/assets').all(assetsPolicy.isAllowed)
    .get(assets.getAllAssetsFromContract, assets.list)
    .post(Eth.unlockAccount, assets.create);

  app.route('/api/assets/:assetId').all(assetsPolicy.isAllowed)
    .get(assets.read, assets.bindMarketPlaces)
    .put(assets.update)
    .delete(assets.delete);

  // Finish by binding the asset middleware
  app.param('assetId', assets.assetByID);
};
