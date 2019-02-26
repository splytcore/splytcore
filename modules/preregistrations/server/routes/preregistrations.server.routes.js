'use strict';

/**
 * Module dependencies
 */
const preregistrationsPolicy = require('../policies/preregistrations.server.policy')
const preregistrations = require('../controllers/preregistrations.server.controller')

module.exports = function(app) {
  // Preregistrations Routes
  app.route('/api/preregistrations').all(preregistrationsPolicy.isAllowed)
    .get(preregistrations.list)
    .post(preregistrations.create)

  app.route('/api/preregistrations/:preregistrationId/sendInvite').all(preregistrationsPolicy.isAllowed)
    .put(preregistrations.sendInvite)

  app.route('/api/preregistrations/:preregistrationId').all(preregistrationsPolicy.isAllowed)
    .get(preregistrations.read)
    .put(preregistrations.update)
    .delete(preregistrations.delete)

  // Finish by binding the Preregistration middleware
  app.param('preregistrationId', preregistrations.preregistrationByID)
};
