'use strict';

/**
 * Module dependencies.
 */
const path = require('path')
const mongoose = require('mongoose')
const async = require('async')
const Candidate = mongoose.model('Candidate')  
const Review = mongoose.model('Review')  
const errorHandler = require(path.resolve('./modules/core/server/controllers/errors.server.controller'))
const _ = require('lodash')

const config = require(path.resolve('./config/config'))
const nodemailer = require('nodemailer')
const crypto = require('crypto')
const smtpTransport = nodemailer.createTransport(config.mailer.options)

const twilio = require('twilio')
const client = new twilio(config.twilio.SID, config.twilio.authToken)
const twilioClient = twilio(config.twilio.SID, config.twilio.authToken).lookups.v1


//TODO: common functions
exports.sendSMS = function(msg, receiver) {  

  return client.messages.create({
    body: msg,
    to: '+1' + receiver,  // Text this number
    from: config.twilio.from // From a valid Twilio number
  })
  .then((message) => {      
    console.log('message successfull sent')    
  })
  .catch((err) => {
    console.log('sms error')
    console.log(err)
  })

}

exports.sendEmail = function(msg, title, receiever) {
  


}