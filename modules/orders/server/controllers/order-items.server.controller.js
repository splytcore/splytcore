'use strict'

/**
 * Module dependencies.
 */
const path = require('path')
const mongoose = require('mongoose')
const Order = mongoose.model('Order')
const OrderItem = mongoose.model('OrderItem')
const Store = mongoose.model('Store')
const User = mongoose.model('User')

const async = require('async') 
const errorHandler = require(path.resolve('./modules/core/server/controllers/errors.server.controller'))
const  _ = require('lodash')


const config = require(path.resolve('./config/config'))
const nodemailer = require('nodemailer')
const smtpTransport = nodemailer.createTransport(config.mailer.options)


 
// exports.update = function(req, res) {
  
//   let orderItem = req.orderItem

//   orderItem = _.extend(orderItem, req.body)

//   orderItem.save(function(err) {
//     if (err) {
//       return res.status(400).send({
//         message: errorHandler.getErrorMessage(err)
//       })
//     } else {
//       res.jsonp(orderItem)
//     }
//   })
// }



 
exports.shipped = function(req, res) {


  let orderItem = req.orderItem

  orderItem.shipping.status = 'shipped'
  orderItem.shipping.company = req.body.company
  orderItem.shipping.shippedDate = req.body.shippedDateMS ? req.body.shippedDateMS : Date.now() 
  orderItem.shipping.trackingId = req.body.trackingId

  orderItem.save(function(err) {
    if (err) {
      return res.status(400).send({
        message: errorHandler.getErrorMessage(err)
      })
    } else {
      notifyCustomerShipped(req, res, orderItem)
      res.jsonp(orderItem)
    }
  })
}

/*
* Send Order to Customer
*/
function notifyCustomerShipped(req, res, orderItem) {

  let customer = orderItem.order.customer

  async.waterfall([
    function prepEmail(done) {
      var httpTransport = 'http://';
      if (config.secure && config.secure.ssl === true) {
        httpTransport = 'https://';
      }
      res.render(path.resolve('modules/orders/server/templates/customer-shipped-email'), {
        name: customer.firstName,
        appName: config.app.title,
        orderItem: orderItem,
        shippedDate: orderItem.shipping.shippedDate.toString()
      }, function (err, emailHTML) {
        done(err, emailHTML);
      });
    },
    // If valid email, send reset email using service
    function sendIt(emailHTML, done) {
      var mailOptions = {
        to: customer.email,
        from: config.mailer.from,
        subject: 'Item Shipped! - Pollenly',
        html: emailHTML
      };
      smtpTransport.sendMail(mailOptions, function (err) {
        done(err);
      });
    }
  ], function (err) {
    if (err) {
      console.log('shipped email error customer')     
      console.log(err)
    } else {
      console.log('shipped email sent to customer')
    }
  })
      
}

/**
 * Order middleware
 */
exports.orderItemByID = function(req, res, next, id) {

  console.log(id)
  
  if (!mongoose.Types.ObjectId.isValid(id)) {
    return res.status(400).send({
      message: 'Order Item is invalid'
    })
  }
  
  OrderItem.findById(id).populate('seller').populate('order').populate('asset').exec()
    .then((orderItem) => {
      req.orderItem = orderItem
      next()
    })
    .catch((err) => {
      return res.status(400).send({
        message: errorHandler.getErrorMessage(err)
      })
    })
}
