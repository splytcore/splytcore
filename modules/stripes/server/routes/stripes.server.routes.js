'use strict';

/**
 * Module dependencies
 */
var stripesPolicy = require('../policies/stripes.server.policy'),
  stripes = require('../controllers/stripes.server.controller');

module.exports = function(app) {
  // Stripes Routes
  app.route('/api/stripes').all(stripesPolicy.isAllowed)
    .get(stripes.list)
    .post(stripes.create);

  app.route('/api/stripes/:stripeId').all(stripesPolicy.isAllowed)
    .get(stripes.read)
    .put(stripes.update)
    .delete(stripes.delete);

  // Finish by binding the Stripe middleware
  app.param('stripeId', stripes.stripeByID);
};
