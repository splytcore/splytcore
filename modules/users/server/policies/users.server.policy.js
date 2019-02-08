'use strict';

/**
 * Module dependencies
 */
var acl = require('acl');

// Using the memory backend
acl = new acl(new acl.memoryBackend());

/**
 * Invoke Stores Permissions
 */
exports.invokeRolesPolicies = function () {
  acl.allow([{
    roles: ['affiliate'],
    allows: [{
      resources: '/api/users/background',
      permissions: 'get'
    }]
  }]);
};

/**
 * Check If Stores Policy Allows
 */
exports.isAllowed = function (req, res, next) {
  var roles = (req.user) ? req.user.roles : ['guest'];

  console.log(req.user)

  // If an Store is being processed and the current user created it then allow any manipulation
  if (req.store && req.user && req.store.user && req.store.user.id === req.user.id) {
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
