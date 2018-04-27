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

const twilio = require('twilio')
const client = new twilio(config.twilio.SID, config.twilio.authToken)
const twilioClient = twilio(config.twilio.SID, config.twilio.authToken).lookups.v1



exports.sendSMS = function(sms, msg) {  
  console.log('sms: ' + sms)
  console.log('message: ' + msg)
  
  return client.messages.create({
    body: msg,
    to: '+1' + sms,  // Text this number
    from: config.twilio.from // From a valid Twilio number
  })

}

exports.validatePhone = function(phone) {  

  return twilioClient.phoneNumbers(phone).fetch()

}