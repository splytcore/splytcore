'use strict';

/**
 * Module dependencies.
 */
const path = require('path')
const mongoose = require('mongoose')
const async = require('async')
const Candidate = mongoose.model('Candidate')  
const Reviews = mongoose.model('Review')  
const errorHandler = require(path.resolve('./modules/core/server/controllers/errors.server.controller'))
const _ = require('lodash')

const config = require(path.resolve('./config/config'))
const nodemailer = require('nodemailer')
const crypto = require('crypto')
const smtpTransport = nodemailer.createTransport(config.mailer.options)

const twilio = require('twilio')
const client = new twilio(config.twilio.SID, config.twilio.authToken)
const twilioClient = twilio(config.twilio.SID, config.twilio.authToken).lookups.v1



exports.create = function(req, res) {
}

exports.read = function(req, res) {
}

exports.findByCandidateId = function(req, res) {
}

exports.delete = function(req, res) {
}

exports.list = function(req, res) {
}

exports.update = function(req, res) {
}


//middleware
exports.byID = function(req, res) {
}

