'use strict';

/**
 * Module dependencies
 */
const storeAssetsPolicy = require('../policies/store-assets.server.policy')
const storeAssets = require('../controllers/store-assets.server.controller')

module.exports = function(app) {
  // Stores Routes
  app.route('/api/storeassets').all(storeAssetsPolicy.isAllowed)
    .get(storeAssets.list)

  app.route('/api/storeassets').all(storeAssetsPolicy.onlyStoreCreator)
    .post(storeAssets.create)

  app.route('/api/storeassets/:storeAssetId').all(storeAssetsPolicy.isAllowed)
    .get(storeAssets.read)

  app.route('/api/storeassets/:storeAssetId').all(storeAssetsPolicy.onlyStoreCreator)
    .put(storeAssets.update)
    .delete(storeAssets.delete)

  // Finish by binding the Store middleware
  app.param('storeAssetId', storeAssets.storeAssetByID)

}
