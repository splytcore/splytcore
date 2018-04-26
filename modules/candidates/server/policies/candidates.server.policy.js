'use strict';

/**
 * Module dependencies
 */
var acl = require('acl');

// Using the memory backend
acl = new acl(new acl.memoryBackend());

/**
 * Invoke Candidates Permissions
 */
exports.invokeRolesPolicies = function () {
  acl.allow([{
    roles: ['user', 'admin'],
    allows: [{
      resources: '/api/candidates',
      permissions: ['get', 'post']
    }, {
      resources: ['/api/candidates/:candidateId', 
                  '/api/candidates/:candidateId/unlock', 
                  '/api/candidates/:candidateId/lock',
                  '/api/findCandidate/:search'
                  ],
      permissions: ['get','post', 'put', 'delete']
    }]
  }])
}

/**
 * Check If Candidates Policy Allows
 */
exports.isAllowed = function (req, res, next) {
  var roles = (req.user) ? req.user.roles : ['guest'];

  // If an Candidate is being processed and the current user created it then allow any manipulation
  if (req.candidate && req.user && req.candidate.user && req.candidate.user.id === req.user.id) {
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
