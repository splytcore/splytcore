'use strict';

/**
 * Module dependencies
 */
var marketsPolicy = require('../policies/markets.server.policy'),
  markets = require('../controllers/markets.server.controller');

module.exports = function(app) {
  // Markets Routes
  app.route('/api/markets').all(marketsPolicy.isAllowed)
    .get(markets.list)
    .post(markets.create);

  app.route('/api/markets/:marketId').all(marketsPolicy.isAllowed)
    .get(markets.read)
    .put(markets.update)
    .delete(markets.delete);

  // Finish by binding the Market middleware
  app.param('marketId', markets.marketByID);
};
