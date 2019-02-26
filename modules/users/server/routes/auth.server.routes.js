'use strict';

/**
 * Module dependencies.
 */
const passport = require('passport')
const path = require('path')

module.exports = function (app) {
  // User Routes
  let users = require('../controllers/users.server.controller')

  //TODO: preregistered
  // let prereg = require(path.resolve('./modules/preregistrations/server/controllers/preregistrations.server.controller'))

  // Setting up the users password api
  app.route('/api/auth/forgot').post(users.forgot)
  app.route('/api/auth/reset/:token').get(users.validateResetToken)
  app.route('/api/auth/reset/:token').post(users.reset)

  // Setting up the users authentication api
  app.route('/api/auth/signup').post(users.signup)
  app.route('/api/auth/signin').post(users.signin)
  app.route('/api/auth/signout').get(users.signout)

};
