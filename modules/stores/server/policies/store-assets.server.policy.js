'use strict';

/**
 * Module dependencies
 */
const mongoose = require('mongoose')
const Store = mongoose.model('Store')
var acl = require('acl');

// Using the memory backend
acl = new acl(new acl.memoryBackend());

/**
 * Invoke Stores Permissions
 */
exports.invokeRolesPolicies = function () {
  acl.allow([{
    roles: ['admin'],
    allows: [{
      resources: '/api/storeassets',
      permissions: '*'
    }, {
      resources: '/api/storeassets/:storeAssetId',
      permissions: '*'
    }]
  }, {
    roles: ['affiliate'],
    allows: [{
      resources: '/api/storeassets',
      permissions: ['get', 'post']
    }, {
      resources: '/api/storeassets/:storeAssetId',
      permissions: ['get', 'put', 'delete']
    }]
  }, {
    roles: ['guest', 'customer', 'seller'],
    allows: [{
      resources: '/api/storeassets',
      permissions: ['get']
    }, {
      resources: '/api/storeassets/:storeAssetId',
      permissions: ['get']
    }]
  }]);
};

/**
 * Only allow store creator rule
 */
exports.onlyStoreCreator = function (req, res, next) {

  if (req.user && req.storeAsset) {

    console.log('storeId: ' + req.storeAsset.store.id)
    console.log('userId: ' + req.user.id)

    let storeId = req.storeAsset.store.id
    let affiliateId = req.user.id

    Store.count({ _id: storeId, affiliate: affiliateId }).exec((err, count) => {
      console.log('is this your store? ' + count)
      if (count > 0) {
        return next()
      } else {
        return res.status(403).json({
          message: 'User is not authorized. Only store creator is allowed'
        })       
      }
    })

  } else {
    return res.status(403).json({
      message: 'User is not authorized. Only store creator allowed'
    })   
  }
}

/**
 * Check If Stores Policy Allows
 */
exports.isAllowed = function (req, res, next) {
  var roles = (req.user) ? req.user.roles : ['guest'];

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

