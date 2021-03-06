'use strict'

/**
 * Module dependencies.
 */
const adminPolicy = require('../policies/admin.server.policy')
const admin = require('../controllers/admin.server.controller')  

module.exports = function (app) {
  // User route registration first. Ref: #713
  require('./users.server.routes.js')(app)

  // Users collection routes
  app.route('/api/users')
    .get(adminPolicy.isAllowed, admin.list)

  // Single user routes
  app.route('/api/users/:userId')
    .get(adminPolicy.isAllowed, admin.read)
    .put(adminPolicy.isAllowed, admin.update)
    .delete(adminPolicy.isAllowed, admin.delete)

  // only only admin to fetch system info
  app.route('/api/systems').all(adminPolicy.isAllowed)
    .get(admin.settings)

  // Finish by binding the user middleware
  app.param('userId', admin.userByID)

}