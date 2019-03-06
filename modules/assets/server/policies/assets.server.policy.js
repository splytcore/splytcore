'use strict';

/**
 * Module dependencies
 */
var acl = require('acl');

// Using the memory backend
acl = new acl(new acl.memoryBackend());

/**
 * Invoke assets Permissions
 */
exports.invokeRolesPolicies = function () {
  acl.allow([{
    roles: ['admin'],
    allows: [{
      resources: '/api/assets',
      permissions: '*'
    }, {
      resources: '/api/assets/:assetId',
      permissions: '*'
    }]
  }, {
    roles: ['user', 'seller', 'affiliate', 'customer'],
    allows: [{
      resources: ['/api/assets'],
      permissions: ['get', 'post']
    }, {
      resources: '/api/assets/:assetId',
      permissions: ['get', 'put', 'delete']
    }]
  }, {
    roles: ['seller'],
    allows: [{
      resources: ['/api/assets/mine'],
      permissions: ['get']
    }]
  }, {
    roles: ['guest'],
    allows: [{
      resources: '/api/assets',
      permissions: ['get']
    }, {
      resources: '/api/assets/:assetId',
      permissions: ['get']
    }]
  }]);
};
/**
 * Check If asset creator allows modification
 */
exports.onlyAssetCreator = function (req, res, next) {

  if (req.user.id === req.asset.user.id) {
    return next()
  } else {
    return res.status(403).json({
      message: 'User is not authorized'
    })     
  }

}

/**
 * Check If assets Policy Allows
 */
exports.isAllowed = function (req, res, next) {
  var roles = (req.user) ? req.user.roles : ['guest'];

  // If an asset is being processed and the current user created it then allow any manipulation
  if (req.asset && req.user && req.asset.user && req.asset.user.id === req.user.id) {
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
