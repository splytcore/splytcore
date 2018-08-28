'use strict';

/**
 * Module dependencies
 */
var eth = require('../controllers/eth.server.controller');

module.exports = function(app) {
  // Orders Routes
  app.route('/api/abi/splytManagerABI')
    .get(eth.getSplytManagerABI)


};
