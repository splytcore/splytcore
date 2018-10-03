'use strict';

/**
 * Module dependencies
 */
var eth = require('../controllers/eth.server.controller');

module.exports = function(app) {
  // Orders Routes
  app.route('/api/abi/getAll')
    .get(eth.getAll)

  app.route('/api/eth/getDefaultWallets')
    .get(eth.getDefaultWallets)

  app.route('/api/eth/addMarketPlace')
    .post(eth.addMarketPlace)

  //give tokens to user for DEV ONLY
  app.route('/api/eth/initUser')
    .get(eth.initUser)

  app.route('/api/eth/getSplytServiceInfo')
    .get(eth.getSplytServiceInfo)

  app.route('/api/eth/createNewAccount')
    .post(eth.createNewAccount)


  //FOR DEV PURPOSE ONLY
  app.route('/api/eth/addAccountByPrivateKey')
    .get(eth.addAccountByPrivateKey)
  //FOR DEV PURPOSE ONLY
  app.route('/api/eth/isAccountExist')
    .get(eth.isAccountExist)

}
