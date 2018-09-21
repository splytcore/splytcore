'use strict';

/**
 * Module dependencies
 */
var assetsPolicy = require('../policies/assets.server.policy'),
  assets = require('../controllers/assets.server.controller');

module.exports = function(app) {
  // assets Routes
  app.route('/api/assets').all(assetsPolicy.isAllowed)
    .get(assets.list)
    .post(assets.create);

  app.route('/api/assets/:assetId').all(assetsPolicy.isAllowed)
    .get(assets.read)
    .put(assets.update)
    .delete(assets.delete);

  // Finish by binding the asset middleware
  app.param('assetId', assets.assetByID);
};
