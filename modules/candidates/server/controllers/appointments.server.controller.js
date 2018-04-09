'use strict';

/**
 * Module dependencies.
 */
const path = require('path')
const mongoose = require('mongoose')

mongoose.Promise = require('bluebird')

const async = require('async')
const Candidate = mongoose.model('Candidate')  

const Appointment = mongoose.model('Appointment')  

const errorHandler = require(path.resolve('./modules/core/server/controllers/errors.server.controller'))
const _ = require('lodash')

const config = require(path.resolve('./config/config'))
const nodemailer = require('nodemailer')
const crypto = require('crypto')
const smtpTransport = nodemailer.createTransport(config.mailer.options)

const twilio = require('twilio')
const client = new twilio(config.twilio.SID, config.twilio.authToken)
const twilioClient = twilio(config.twilio.SID, config.twilio.authToken).lookups.v1


//@desc creates a schedule in x increments from now
exports.createSchedule = function(req, res) {  

  let appt = new Appointment()
  appt.time = Date.now()
  appt.department = req.user.department
  appt.interviewer = req.user

  appt.save()
    .then((appt) => {

    })
    .catch((err) => {

    })

}

exports.Email = function(candidate, msg, title, receiever) {

}


exports.getAppointment = function(candidate, receiever) {



}