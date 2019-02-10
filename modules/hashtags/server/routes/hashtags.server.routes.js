'use strict';

/**
 * Module dependencies
 */
var hashtagsPolicy = require('../policies/hashtags.server.policy'),
  hashtags = require('../controllers/hashtags.server.controller');

module.exports = function(app) {
  // Hashtags Routes
  app.route('/api/hashtags').all(hashtagsPolicy.isAllowed)
    .get(hashtags.list)
    .post(hashtags.create);

  app.route('/api/hashtags/:hashtagId').all(hashtagsPolicy.isAllowed)
    .get(hashtags.read)
    .put(hashtags.update)
    .delete(hashtags.delete);

  // Finish by binding the Hashtag middleware
  app.param('hashtagId', hashtags.hashtagByID);
};
