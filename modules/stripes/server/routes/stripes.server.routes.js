'use strict';

/**
 * Module dependencies
 */
const path = require('path')
const stripesPolicy = require('../policies/stripes.server.policy')
const stripes = require('../controllers/stripes.server.controller')
const usersProfile = require(path.resolve('./modules/users/server/controllers/users/users.profile.server.controller'))

module.exports = function(app) {
  // Stripes Routes
  app.route('/api/stripes').all(stripesPolicy.isAllowed)
    .get(stripes.list)
    .post(stripes.create);

  app.route('/api/stripes/:stripeId').all(stripesPolicy.isAllowed)
    .get(stripes.read)
    .put(stripes.update)
    .delete(stripes.delete);

  app.route('/api/instagram/saveIgCode')
    .post(stripes.saveIgCode, usersProfile.update);

  // Finish by binding the Stripe middleware
  app.param('stripeId', stripes.stripeByID);
};
