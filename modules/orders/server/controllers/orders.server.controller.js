'use strict'

/**
 * Module dependencies.
 */
var path = require('path'),
  mongoose = require('mongoose'),
  Order = mongoose.model('Order'),
  async = require('async'),  
  errorHandler = require(path.resolve('./modules/core/server/controllers/errors.server.controller')),
  EthService = require(path.resolve('./modules/eth/server/services/eth.server.service')),  
  _ = require('lodash')

/**
 * Create a Order
 */
exports.create = function(req, res) {

  console.log('creating order')

  let createOrder = new Promise((resolve, reject) => {
    let order = new Order(req.body)
    order.user = req.user
    order.save((err) => {
      
      if (err) {
        reject(err)
      } else {
        resolve(order)
      }         
    })
  })


  createOrder.then((order) => {
    var item = new OrderItem(req.body)
    item.save((err) => {
      if (err) {
        return res.status(400).send({
          message: err.toString()
        })
      } else {
        res.jsonp(order)
      }         
    })
  })
  .error((err) => {
    console.log(err)    
  })


}


exports.requestRefund = function(req, res) {

  console.log('requesting refund')

  let order = req.order
  let user = req.user

  EthService.requestRefund(order._id, user.publicKey)
    .on('transactionHash', (hash) => {
      // order.transactionHash = hash
      res.jsonp(hash)
    }) 
    .on('error', (err) => {
      console.log('error requesting refund')
      console.log(err)
      return res.status(400).send({ message : err.toString() })      
    }
  )

}


exports.approveRefund = function(req, res) {

  console.log('requesting refund')

  let order = req.order
  let user = req.user

  EthService.approveRefund(order._id, user.publicKey)
    .on('transactionHash', (hash) => {
      // order.transactionHash = hash
      res.jsonp(hash)
    }) 
    .on('error', (err) => {
      console.log('error requesting refund')
      console.log(err)
      return res.status(400).send({ message : err.toString() })      
    }
  )

}

/**
 * Show the current Order
 */
exports.read = function(req, res) {
  // convert mongoose document to JSON
  let order = req.order ? req.order.toJSON() : {}

  // Add a custom field to the Article, for determining if the current User is the "owner".
  // NOTE: This field is NOT persisted to the database, since it doesn't exist in the Article model.
  // order.isCurrentUserOwner = req.user && order.user && order.user._id.toString() === req.user._id.toString()
  return  res.jsonp(order)

}

/**
 * Update a Order
 */
exports.update = function(req, res) {
  var order = req.order

  order = _.extend(order, req.body)

  order.save(function(err) {
    if (err) {
      return res.status(400).send({
        message: errorHandler.getErrorMessage(err)
      })
    } else {
      res.jsonp(order)
    }
  })
}

/**
 * Delete an Order
 */
exports.delete = function(req, res) {
  var order = req.order

  order.remove(function(err) {
    if (err) {
      return res.status(400).send({
        message: errorHandler.getErrorMessage(err)
      })
    } else {
      res.jsonp(order)
    }
  })
}

/**
 * List of Orders
 */
exports.list = function(req, res) {

  Order.find().sort('-created').populate('user', 'displayName').exec(function(err, orders) {
    if (err) {
      return res.status(400).send({
        message: errorHandler.getErrorMessage(err)
      })
    } 
    res.jsonp(orders)
  })

}


/**
 * Order middleware
 */
exports.orderByID = function(req, res, next, id) {

  if (!mongoose.Types.ObjectId.isValid(id)) {
    return res.status(400).send({
      message: 'Order is invalid'
    })
  }

  Order.findById(id).populate('user', 'displayName').exec(function (err, order) {
    if (err) {
      return next(err)
    } else if (!order) {
      return res.status(404).send({
        message: 'No Order with that identifier has been found'
      })
    }
    req.order = order
    next()
  })
}
