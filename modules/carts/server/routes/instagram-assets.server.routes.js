'use strict';

/**
 * Module dependencies
 */
const path = require('path')
const instagramAssets = require('../controllers/instagram-assets.server.controller')


module.exports = function(app) {

  app.route('/api/instagramAssets/:storeId')
    .get(instagramAssets.read)

}
