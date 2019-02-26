'use strict'

/**
 * Module dependencies.
 */
const path = require('path')
const mongoose = require('mongoose')
const Order = mongoose.model('Order')
const OrderItem = mongoose.model('OrderItem')

const Asset = mongoose.model('Asset')
const Cart = mongoose.model('Cart')
const CartItem = mongoose.model('CartItem')

const Store = mongoose.model('Store')
const User = mongoose.model('User')

const async = require('async') 
const errorHandler = require(path.resolve('./modules/core/server/controllers/errors.server.controller'))
const EthService = require(path.resolve('./modules/eth/server/services/eth.server.service'))
const  _ = require('lodash')

const curl = new (require('curl-request'))()

const config = require(path.resolve('./config/config'))
const nodemailer = require('nodemailer')
const smtpTransport = nodemailer.createTransport(config.mailer.options)

/**
 * Create a Order
 */
exports.create = function(req, res, next) {

  console.log('creating order')
  console.log(req.body)
  
  let cartId = req.body.cart

  async.waterfall([
    function getCartHeader(callback) {
      Cart.findById(cartId).populate('store').exec(function(err, cart) {
        callback(err, cart)
      })         
    },
    function createOrder(cart, callback) {
      
      let order = new Order(req.body)
      order.customer = req.user
      // order.store = cart.store

      order.save((err) => {
        req.orderItems = []
        callback(err, order)
      })
    },
    function getItems(order, callback) {
      CartItem.find({ cart: cartId }).deepPopulate('asset.user hashtag').exec(function(err, items) {
        callback(err, order, items)
      })        
    },
    function createOrderDetails(order, cartItems, callback) {
      async.each(cartItems, function(cartItem, cb) {
        let orderItem = new OrderItem(cartItem)
        orderItem.order = order
        orderItem.seller = cartItem.asset.user
        orderItem.affiliate = cartItem.affiliate
        orderItem.soldPrice = cartItem.asset.price
        orderItem.reward = cartItem.asset.reward
    
        // console.log('qty:' + cartItem.quantity)
        // console.log('price: ' + cartItem.asset.price)

        //update totals for header
        order.totalCost += (cartItem.quantity * cartItem.asset.price)
        order.totalQuantity += cartItem.quantity
        orderItem.save((err) => {
          if (err) {
            cb(err)
          } else {
            //send fulfill email order to each seller
            emailOrderReceiptToSeller(req, res, orderItem)
            req.orderItems.push(orderItem)
            if (orderItem.hashtag) {
            //notifiy affiliate 
              emailOrderNotificationToAffiliate(req, res, orderItem)              
            }
            cb(null)
          }
        })
      }, function(err) {
        callback(err, order)
      });
    },
    function updateOrderTotals(order, callback) {
      order.save((err) => {
        req.order = order
        callback(err, order)
      })
    },    
    function sendEmailReceiptCustomer(order, callback) {
      //emailOrderReceiptToCustomer(req, res, order)   
      callback(null, order)
    }

  ], function (err, order) {
    if (err) {
      console.log(err)
      return res.status(400).send({
        message: errorHandler.getErrorMessage(err)
      })
    } else {
      res.clearCookie('cartId')
      next()      
    }
  })
  
}


/*
* Send Order to Customer
*/
function emailOrderReceiptToCustomer(req, res, order) {

  let customer = order.customer

  async.waterfall([
    function prepEmail(done) {
      var httpTransport = 'http://';
      if (config.secure && config.secure.ssl === true) {
        httpTransport = 'https://';
      }
      res.render(path.resolve('modules/orders/server/templates/customer-order-email'), {
        name: customer.displayName,
        appName: config.app.title,
        orderId: order.id,
        url: req.headers.origin + '/orders/' + order.id
      }, function (err, emailHTML) {
        done(err, emailHTML, customer);
      });
    },
    // If valid email, send reset email using service
    function sendIt(emailHTML, user, done) {
      var mailOptions = {
        to: customer.email,
        from: config.mailer.from,
        subject: 'New Order - Pollenly',
        html: emailHTML
      };
      smtpTransport.sendMail(mailOptions, function (err) {
        done(err);
      });
    }
  ], function (err) {
    if (err) {
      console.log('email error sending customer')     
      console.log(err)
    } else {
      console.log('email sent to customer')
    }
  })
      
}

function emailOrderReceiptToSeller(req, res, orderItem) {
  console.log('orderitem')
  
  console.log(orderItem.asset.id)

  async.waterfall([
    function getSellerFromAsset(done) {
      let assetId = orderItem.asset.id
      Asset.findById(assetId).populate('user').exec(function(err, asset) {
        done(err, asset)
      })
    },    
    function prepEmail(asset, done) {
      var httpTransport = 'http://'
      if (config.secure && config.secure.ssl === true) {
        httpTransport = 'https://'
      }
    
      res.render(path.resolve('modules/orders/server/templates/seller-order-email'), {
        name: asset.user.displayName,
        appName: config.app.title,
        url: req.headers.origin + '/orders/' + orderItem.order.id,
        asset: asset,
        orderItem: orderItem,
        order: orderItem.order,
        totalQuantity: orderItem.quantity,
        totalCost: orderItem.totalCost
      }, function (err, emailHTML) {
        done(err, emailHTML, asset);
      });
    },
    // If valid email, send reset email using service
    function sendIt(emailHTML, asset, done) {
      var mailOptions = {
        to: asset.user.email,
        from: config.mailer.from,
        subject: 'New Order Fulfillment - Pollenly',
        html: emailHTML
      }
      smtpTransport.sendMail(mailOptions, function (err) {
        done(err);
      });
    }
  ], function (err) {
    if (err) {
      console.log('error sending email to seller')     
      console.log(err)
    } else {
      console.log('email sent to seller')      
    }
  })
      

}


function emailOrderNotificationToAffiliate(req, res, orderItem) {

  // console.log(orderItem.asset.toString())
  console.log('affiliate')
  console.log(orderItem.hashtag.affiliate)

  async.waterfall([   
    function getAffiliateFromHashtag(done) {
      let affiliateId = orderItem.hashtag.affiliate.toString()
      User.findById(affiliateId).exec(function(err, affiliate) {
        done(err, affiliate)
      })
    },        
    function prepEmail(affiliate, done) {
    
      var httpTransport = 'http://'
      if (config.secure && config.secure.ssl === true) {
        httpTransport = 'https://'
      }
      res.render(path.resolve('modules/orders/server/templates/affiliate-order-email'), {
        name: affiliate.displayName,
        appName: config.app.title,
        asset: orderItem.hashtag.asset,
        url: req.headers.origin + '/orders/' + orderItem.order.id,
        orderId: orderItem.order.id,
        totalQuantity: orderItem.quantity,
        totalCost: orderItem.totalCost
      }, function (err, emailHTML) {
        done(err, affiliate, emailHTML);
      });
    },
    // If valid email, send reset email using service
    function sendIt(affiliate, emailHTML, done) {
      var mailOptions = {
        to: affiliate.email,
        from: config.mailer.from,
        subject: 'Congratulations Affiliate! - Pollenly',
        html: emailHTML
      }
      smtpTransport.sendMail(mailOptions, function (err) {
        done(err);
      });
    }
  ], function (err) {
    if (err) {
      console.log('error sending email to affiliate')      
      console.log(err)
    } else {
      console.log('email sent to affiliate')      
    }
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
    
  //remove addresses of order if viewing as guest for now
  if (!req.user) {
    delete order.shipping
    delete order.billing
  }

  res.jsonp(order)

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

  let roles = req.user ? req.user.roles : 'guest'

  if (roles.indexOf('customer') > -1) {
    exports.ordersByCustomer(req, res)
  }

  if (roles.indexOf('affiliate') > -1) {
    exports.ordersByAffiliate(req, res)
  }

  if (roles.indexOf('seller') > -1) {
    exports.ordersBySeller(req, res)
  }

  if (roles.indexOf('guest') > -1) {
      return res.status(400).send({
        message: 'Not authorized for guests roles'
      })
  }

}

/**
 * List of Orders
 */

exports.ordersByCustomer = function(req, res) {

  let q = req.query
  let sort = q.sort
  delete q.sort
  q.customer = req.user.id

  console.log(q)

  Order.find(q).sort(sort)
    .populate('customer', 'displayName')
    .exec(function(err, orders) {
    if (err) {
      return res.status(400).send({
        message: errorHandler.getErrorMessage(err)
      })
    } 
    res.jsonp(orders)
  })

}
/**
 * List of Orders
 */
exports.ordersByAffiliate = function(req, res) {

  let q = req.query
  let sort = q.sort
  delete q.sort

  let affiliateId = req.user.id

  Store.findOne({ affiliate: affiliateId }).exec()
    .then((store) => {
      if (store) {
        return OrderItem.find({ store : store._id }).populate('order').exec()
      } else {
        return Promise.reject('No store found for this affiliate')
      }
    })
    .then((orderItems) => {
      // console.log('order items')
      // console.log(orderItems)
      let orderIds = orderItems.map((item) => item.order.id)
      let orderIdsUnique = orderIds.filter((id) => orderIds.indexOf(id) > -1)
      // console.log(orderIdsUnique)
      return Order.find({ _id : { $in: orderIdsUnique }}).populate('customer', 'displayName').exec()
    })    
    .then((orders) => {
      res.jsonp(orders)
    })
    .catch((err) => {
      console.log(err)
      return res.status(400).send({
        message: errorHandler.getErrorMessage(err)
      })      
    })

}
/**
 * List of Orders
 */
exports.ordersBySeller = function(req, res) {

  let q = req.query
  let sort = q.sort
  delete q.sort

  let userId = req.user.id

  Asset.find({ user: userId }).exec()
    .then((assets) => {
      let assetIds = assets.map((asset) => asset.id)      
      return OrderItem.find({ asset: {$in : assetIds }}).populate('order').exec()
    })
    .then((orderItems) => {
      let orderIds = orderItems.map((item) => item.order.id)
      let orderIdsUnique = orderIds.filter((id) => orderIds.indexOf(id) > -1)
      // console.log(orderIdsUnique)
      return Order.find({ _id : { $in: orderIdsUnique }}).populate('customer', 'displayName').exec()
    })
    .then((orders) => {
      res.jsonp(orders)
    })    
    .catch((err) => {
      // console.log(err)
      return res.status(400).send({
        message: errorHandler.getErrorMessage(err)
      })      
    })

}
/**
 * Charge client for the given amount
 */

exports.charge = (req, res, next) => {
  console.log('Now charging customer card')
  if(!req.body.stripeToken) {
    next()
  }

  curl.setHeaders([
        'Authorization: Bearer ' + config.stripe.secretKey
  ])

  console.log('about to charge customer')
  console.log('amount: ', req.order.totalCost * 100)
  console.log('strike token: ', req.body.stripeToken)
  console.log('orderId: ', req.order._id)

  curl.setBody({
    'amount': req.order.totalCost * 100,
    'currency':'USD',
    'source': req.body.stripeToken,
    'description': req.order._id
    // 'customer': req.order.customer.lastName + ', ' + req.order.customer.firstName
  }).post('https://api.stripe.com/v1/charges')
  .then((error, response) => {
    console.log(error)
    if(error) {
      return res.status(400).send({
        message: 'Could not charge credit card'
      })
    }
    Order.findByIdAndUpdate(req.order._id, { status: 'settled' }, { }, function(err, order) {
      if(err) {
        console.log('orders server controller line 538')
        console.log(err)
        return res.status(400).send({
          message: errorHandler.getErrorMessage(err)
        })
      }
      next()
    })
  }).catch(err => {
    console.log(err)
    return res.status(400).send({
      message: errorHandler.getErrorMessage(err)
    })
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
  
  Order.findById(id).populate('customer', 'displayName').exec(function (err, order) {
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
