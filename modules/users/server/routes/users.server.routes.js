'use strict'

module.exports = function (app) {
  // User Routes
  let users = require('../controllers/users.server.controller')
  let usersPolicy = require('../policies/users.server.policy')

  // Setting up the users profile api
  app.route('/api/users/me').get(users.me)
  app.route('/api/users').all(usersPolicy.isAllowed)
  .put(users.saveIgCode, users.update)
  app.route('/api/users/password').post(users.changePassword)
  app.route('/api/users/picture').post(users.changeProfilePicture)
  app.route('/api/users/background').all(usersPolicy.isAllowed)
  .get(users.getBackgroundImage)
  
  //app.route('/api/users/balances').get(users.getBalances)

  app.route('/api/users/newAccount').get(users.createAccount)

  // Finish by binding the user middleware
  app.param('userId', users.userByID)
}
