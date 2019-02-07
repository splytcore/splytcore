'use strict';

/**
 * Module dependencies
 */
const affiliatesPolicy = require('../policies/affiliates.server.policy')
const affiliates = require('../controllers/affiliates.server.controller')

module.exports = function(app) {

  app.route('/api/affiliates/sales')
    .get(affiliates.getSales)


  // affiliates Routes
  // app.route('/api/affiliates').all(affiliatesPolicy.isAllowed)
  //   .get(affiliates.list)
  //   .post(affiliates.create)

  // app.route('/api/affiliates').all(affiliatesPolicy.isAllowed)
  //   .get(affiliates.list)
  //   .post(affiliates.create)

  // app.route('/api/affiliates/:analyticId').all(affiliatesPolicy.isAllowed)
  //   .get(affiliates.read)
  //   .put(affiliates.update)
  //   .delete(affiliates.delete)

  // Finish by binding the Analytic middleware
}
