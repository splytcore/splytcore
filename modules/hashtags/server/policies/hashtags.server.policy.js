'use strict';

/**
 * Module dependencies
 */
var acl = require('acl');

// Using the memory backend
acl = new acl(new acl.memoryBackend());

/**
 * Invoke Hashtags Permissions
 */
exports.invokeRolesPolicies = function () {
  acl.allow([{
    roles: ['admin'],
    allows: [{
      resources: '/api/hashtags',
      permissions: '*'
    }, {
      resources: '/api/hashtags/:hashtagId',
      permissions: '*'
    }]
  }, {
    roles: ['user', 'affiliate'],
    allows: [{
      resources: '/api/hashtags',
      permissions: ['get', 'post']
    }, {
      resources: '/api/hashtags/:hashtagId',
      permissions: ['get']
    }]
  }, {
    roles: ['guest'],
    allows: [{
      resources: '/api/hashtags',
      permissions: ['get']
    }, {
      resources: '/api/hashtags/:hashtagId',
      permissions: ['get']
    }]
  }]);
};

/**
 * Check If Hashtags Policy Allows
 */
exports.isAllowed = function (req, res, next) {
  var roles = (req.user) ? req.user.roles : ['guest'];

  // If an Hashtag is being processed and the current user created it then allow any manipulation
  if (req.hashtag && req.user && req.hashtag.affiliate && req.hashtag.affiliate.id === req.user.id) {
    return next();
  }

  // Check for user roles
  acl.areAnyRolesAllowed(roles, req.route.path, req.method.toLowerCase(), function (err, isAllowed) {
    if (err) {
      // An authorization error occurred
      return res.status(500).send('Unexpected authorization error');
    } else {
      if (isAllowed) {
        // Access granted! Invoke next middleware
        return next();
      } else {
        return res.status(403).json({
          message: 'User is not authorized'
        });
      }
    }
  });
};
