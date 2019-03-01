'use strict';

/**
 * Module dependencies
 */
let acl  = require('acl')

// Using the memory backend
acl = new acl(new acl.memoryBackend())

/**
 * Invoke Orders Permissions
 */
exports.invokeRolesPolicies = function () {
  
  acl.allow([{
    roles: ['admin'],
    allows: [{
      resources: '/api/orderitems',
      permissions: '*'
    }, {
      resources: '/api/orderitems/:orderItemId',
      permissions: '*'
    }]
  }, {
    roles: ['user', 'seller', 'affiliate', 'admin'],
    allows: [{
      resources: '/api/orderitems',
      permissions: ['get', 'post']
    }, {
      resources: '/api/orderitems/:orderItemId',
      permissions: ['get', 'put']
    }]
  }])
}

/**
 * Check If Orders Policy Allows
 */
exports.isAllowed = function (req, res, next) {

  var roles = (req.user) ? req.user.roles : ['guest']

  // Check for user roles
  acl.areAnyRolesAllowed(roles, req.route.path, req.method.toLowerCase(), function (err, isAllowed) {
    if (err) {
      // An authorization error occurred
      return res.status(500).send('Unexpected authorization error');
    } else {
      console.log('is allowed: ' + isAllowed)
      if (isAllowed) {
        // Access granted! Invoke next middleware
        return next()
      } else {
        return res.status(403).json({
          message: 'User is not authorized'
        })
      }
    }
  })

}

/*
* Only sellier of item allowed to perform action
* 
*/
exports.onlySellerOrAdminOfOrderItem = function (req, res, next) {

  let sellerId = req.orderItem.seller ? req.orderItem.seller.id : null
  let userId = req.user ? req.user.id : null
  let roles = req.user ? req.user.roles : 'guest'

  console.log(sellerId)
  console.log(userId)

  if (sellerId && userId) {
    if (sellerId.indexOf(userId) > -1 || roles.indexOf('admin') > -1) {
      next()
    } else {
      return res.status(400).send({
        message: 'Only admin or seller of this item is authorized!'
      })          
    }
  } else {
    return res.status(400).send({
      message: 'Only admin or seller of this item is authorized!'
    })  
  }
}