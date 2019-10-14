'use strict';

/**
 * Module dependencies
 */
var acl = require('acl');

// Using the memory backend
acl = new acl(new acl.memoryBackend());

/**
 * Invoke Shopifies Permissions
 */
exports.invokeRolesPolicies = function () {
  acl.allow([{
    roles: ['admin'],
    allows: [{
      resources: '/api/shopifies.angjs',
      permissions: '*'
    }, {
      resources: '/api/shopifies.angjs/:shopifyId',
      permissions: '*'
    }]
  }, {
    roles: ['seller', 'admin'],
    allows: [{
      resources: ['/api/shopifies.angjs', '/api/shopifies/:shopifyId/push'],
      permissions: ['post']
    }, {
      resources: ['/api/shopifies.angjs/:shopifyId', '/api/shopifies.angjs', '/api/shopifies/:shopifyId/pull'],
      permissions: ['get']
    }]
  },{
    roles: ['seller', 'admin'],
    allows: [{
      resources: '/api/shopifies.angjs',
      permissions: ['put']
    }]
  }, {
    roles: ['guest'],
    allows: [{
      resources: '/api/shopifies.angjs',
      permissions: ['get']
    }, {
      resources: '/api/shopifies.angjs/:shopifyId',
      permissions: ['get']
    }]
  }]);
};

/**
 * Check If Shopifies Policy Allows
 */
exports.isAllowed = function (req, res, next) {
  var roles = (req.user) ? req.user.roles : ['guest'];

  // If an Shopify is being processed and the current user created it then allow any manipulation
  if (req.shopify && req.user && req.shopify.user && req.shopify.user.id === req.user.id) {
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
