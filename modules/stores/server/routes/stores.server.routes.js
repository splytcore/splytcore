'use strict';

/**
 * Module dependencies
 */
var storesPolicy = require('../policies/stores.server.policy'),
  stores = require('../controllers/stores.server.controller');

module.exports = function(app) {
  // Stores Routes
  app.route('/api/stores').all(storesPolicy.isAllowed)
    .get(stores.list)
    .post(stores.create);

  app.route('/api/stores/:storeId').all(storesPolicy.isAllowed)
    .get(stores.read)
    .put(stores.update)
    .delete(stores.delete);

  // Finish by binding the Store middleware
  app.param('storeId', stores.storeByID);
};
