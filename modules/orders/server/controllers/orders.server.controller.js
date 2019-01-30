'use strict'

/**
 * Module dependencies.
 */
var path = require('path'),
  mongoose = require('mongoose'),
  Order = mongoose.model('Order'),
  OrderItem = mongoose.model('OrderItem'),

  Cart = mongoose.model('Cart'),
  CartItem = mongoose.model('CartItem'),

  Promise = require("bluebird"),

  async = require('async'),  
  errorHandler = require(path.resolve('./modules/core/server/controllers/errors.server.controller')),
  EthService = require(path.resolve('./modules/eth/server/services/eth.server.service')),  
  _ = require('lodash')

  const curl = new (require('curl-request'))()
  const config = require(path.resolve('./config/config'))


/**
 * Create a Order
 */
exports.create = function(req, res) {

  console.log('creating order')
  console.log(req.body)
  
  async.waterfall([
    function createOrder(callback) {
        let order = new Order(req.body)
        order.user = req.user
        order.save((err) => {
          callback(err, order)
        })
    },
    function getItems(order, callback) {
      CartItem.find({ cart: order.cart }).exec(function(err, items) {
        callback(err, order, items)
      })        
    },
    function createOrderDetails(order, cartItems, callback) {
        async.each(cartItems, function(cartItem, cb) {
          let orderItem = new OrderItem()
          orderItem.order = order
          orderItem.asset = cartItem.asset
          orderItem.quantity = cartItem.quantity
          orderItem.save((err) => {
            cb(err)
          })
        }, function(err) {
          callback(order)
        });
    }
  ], function (err, order) {
    res.jsonp(order)
  });

  
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
  console.log(order)
  OrderItem.find({ order: order._id }).sort('-created').populate('asset').exec(function(err, items) {
    if (err) {
      return res.status(400).send({
        message: errorHandler.getErrorMessage(err)
      })
    } 
    console.log('number of items: ' + items.length)
    order.items = items
    res.jsonp(order)
  })

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

  Order.remove({ order : order._id }, function(err) {
    if (err) {
      console.log(err)
    } else {
      console.log('successful delete order items')
    }
  })


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
 * Charge client for the given amount
 */

exports.charge = (req, res, next) => {
  console.log('charge customer here please')
  console.log(req.body)
  if(!req.body.stripeToken) {
    next()
  }

  curl.setHeaders([
    'Authorization: Bearer ' + config.stripe.secretKey
  ])
  curl.setBody({
    'amount': req.body.totalCost * 100,
    'currency':'USD',
    'source': req.body.stripeToken,
    'description': req.body.cart,
  }).post('https://api.stripe.com/v1/charges')
  .then((error, response) => {
    console.log(error)
    console.log(response)
    // if(statusCode === 400) {
    //   console.log(body)
    // }
    // if(statusCode === 200) {
    //   let igInfo = JSON.parse(body)
    //   console.log(igInfo)
    //   req.body.igAccessToken = igInfo.access_token
    //   req.body.profileImageURL = igInfo.user.profile_picture
    //   req.body.firstName = igInfo.user.full_name
      next()
    // }
  }).catch(e => {
    console.log(e)
    return res.status(400).send({ e })
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
