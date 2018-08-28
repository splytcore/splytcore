'use strict';

/**
 * Module dependencies
 */
var eth = require('../controllers/eth.server.controller');

module.exports = function(app) {
  // Orders Routes
  app.route('/api/abi/getAll')
    .get(eth.getAll)


};
