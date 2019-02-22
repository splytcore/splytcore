'use strict';

/**
 * Module dependencies
 */
const path = require('path')
const storesPolicy = require('../policies/stores.server.policy')
const stores = require('../controllers/stores.server.controller')
const core = require(path.resolve('./modules/core/server/controllers/core.server.controller.js'))

module.exports = function(app) {
  // Stores Routes
  app.route('/api/stores').all(storesPolicy.isAllowed)
    .get(stores.list)
    .post(stores.create)

  app.route('/api/store/byname/:name')
    .get(stores.listByName)

  app.route('/api/stores/:storeId').all(storesPolicy.isAllowed)
    .get(core.paginate, stores.read)
    .put(stores.update)
    .delete(stores.delete)


  // Finish by binding the Store middleware
  app.param('storeId', stores.storeByID)

}
