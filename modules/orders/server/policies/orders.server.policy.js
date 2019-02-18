'use strict';

/**
 * Module dependencies
 */
var acl  = require('acl');

// Using the memory backend
acl = new acl(new acl.memoryBackend());

/**
 * Invoke Orders Permissions
 */
exports.invokeRolesPolicies = function () {
  acl.allow([{
    roles: ['admin'],
    allows: [{
      resources: '/api/orders',
      permissions: '*'
    }, {
      resources: '/api/orders/:orderId',
      permissions: '*'
    }]
  }, {
    roles: ['user', 'seller', 'affiliate', 'customer', 'guest'],
    allows: [{
      resources: '/api/orders',
      permissions: ['get', 'post']
    }, {
      resources: '/api/orders/:orderId',
      permissions: ['get', 'put']
    }]
  }, {
    roles: ['guest'],
    allows: [{
      resources: '/api/orders',
      permissions: ['get']
    }, {
      resources: '/api/orders/:orderId',
      permissions: ['get']
    }]
  }]);
};

/**
 * Check If Orders Policy Allows
 */
exports.isAllowed = function (req, res, next) {
  var roles = (req.user) ? req.user.roles : ['guest'];

  // If an Order is being processed and the current user created it then allow any manipulation
  if (req.order && req.user && req.order.customer && req.order.customer.id === req.user.id) {
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
  })

}

/*
* Only users associated with that order should be allowed to view the order
* TODO: bind anytime api with :orderId is called
*/
exports.onlyOrderParticipants = function (req, res, next) {
  
  let roles = (req.user) ? req.user.roles : ['guest'];
  let order = req.order

  if (roles.indexOf('guest') > -1) {
    return res.status(400).send({
      message: 'Not authorized for guests roles'
    })
  }

  // current user needs to part of the order
  if (roles.indexOf('customer') > -1) {
    if (order.customer.id === req.user.id) {
      next()
    } else {
      return res.status(400).send({
        message: 'Not authorized'
      })      
    }
  }

  if (roles.indexOf('affiliate') > -1) {
    let affiliateIds = order.items.map((item) => item.store.affiliate.id)
    if (affiliateIds.indexOf(req.user.id) > -1) {
      next()
    } else {
      return res.status(400).send({
        message: 'Not authorized'
      })          
    }
  }

  if (roles.indexOf('seller') > -1) {
    let sellerIds = order.items.map((item) => item.seller.id)
    if (sellerIds.indexOf(req.user.id) > -1) {
      next()
    } else {
      return res.status(400).send({
        message: 'Not authorized'
      })          
    }    
  }



}