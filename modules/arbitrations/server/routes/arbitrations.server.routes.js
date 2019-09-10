'use strict';

/**
 * Module dependencies
 */
const path = require('path')
const arbitrationsPolicy = require('../policies/arbitrations.server.policy')
const arbitrations = require('../controllers/arbitrations.server.controller')
const Eth = require(path.resolve('./modules/eth/server/controllers/eth.server.controller'))
const UsersAuthCont = require(path.resolve('./modules/users/server/controllers/users/users.authorization.server.controller.js'))


module.exports = function(app) {
  // Arbitrations Routes
  app.route('/api/arbitrations').all(arbitrationsPolicy.isAllowed)
    .get(arbitrations.list)
    .post(UsersAuthCont.getWalletPassword, Eth.unlockAccount, arbitrations.create);

  app.route('/api/arbitrations/:arbitrationId/setArbitrator').all(arbitrationsPolicy.isAllowed)
    .post(UsersAuthCont.getWalletPassword, Eth.unlockAccount, arbitrations.setArbitrator)

  app.route('/api/arbitrations/:arbitrationId/set2xStakeByReporter').all(arbitrationsPolicy.isAllowed)
    .post(UsersAuthCont.getWalletPassword, Eth.unlockAccount, arbitrations.set2xStakeByReporter)

  app.route('/api/arbitrations/:arbitrationId/set2xStakeBySeller').all(arbitrationsPolicy.isAllowed)
    .post(UsersAuthCont.getWalletPassword, Eth.unlockAccount, arbitrations.set2xStakeBySeller)

  app.route('/api/arbitrations/:arbitrationId/setWinner').all(arbitrationsPolicy.isAllowed)
    .post(UsersAuthCont.getWalletPassword, Eth.unlockAccount, arbitrations.setWinner)

  app.route('/api/arbitrations/:arbitrationId').all(arbitrationsPolicy.isAllowed)
    .get(arbitrations.read)
    .put(arbitrations.update)
    .delete(arbitrations.delete);

 
  // Finish by binding the Arbitration middleware
  app.param('arbitrationId', arbitrations.arbitrationByID);
};
