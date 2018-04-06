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



exports.create = function(req, res) {
  
  let review = new Review(req.body)
  review.candidate = req.candidate
  review.reviewer = req.user
  review.save(function (err) {
    if (err) {
      return res.status(400).send({
        message: errorHandler.getErrorMessage(err)
      })
    } else {
      res.jsonp({ message: 'success' })
    }
  })

}

exports.read = function(req, res) {
  let review = req.review ? req.review.toJSON() : {}
  res.jsonp(review)
}

exports.delete = function(req, res) {
  let review = req.review

  review.remove(function (err) {
    if (err) {
      return res.status(400).send({
        message: errorHandler.getErrorMessage(err)
      });
    } else {
      res.jsonp({ message: 'success' });
    }
  })
}

exports.update = function(req, res) {
  let review = req.review
  review = _.extend(review, req.body)
  review.save(function (err) {
    if (err) {
      return res.status(400).send({
        message: errorHandler.getErrorMessage(err)
      })
    } else {
      res.jsonp({ message: 'success' })
    }
  })
}

exports.list = function(req, res) {
  
  Review.find().populate('reviewer', 'displayName').populate('candidate', 'lastName firstName email').exec(function (err, reviews) {
    if (err) {
      return res.status(400).send({
        message: errorHandler.getErrorMessage(err)
      })      
    }         
    res.jsonp(reviews)        
  })
}

//middleware
exports.byCandidate = function(req, res, next) {

  let candidate = req.candidate

  Review.findOne({ candidate: candidate }).populate('candidate', 'lastName firstName email').populate('reviewer', 'displayName').exec(function (err, review) {
    if (err) {
      return res.status(400).send({
        message: errorHandler.getErrorMessage(err)
      })      
    }         
    req.review = review
    next()
  })
}



/**
 * Candidate middleware
 */
exports.byID = function(req, res, next, id) {
  
  if (!mongoose.Types.ObjectId.isValid(id)) {
    return res.status(400).send({
      message: 'Review is invalid'
    });
  }

  Review.findById(id).populate('reviewer', 'displayName').populate('candidate', 'email firstName lastName').exec(function (err, review) {
    if (err) {
      return next(err);
    } else if (!review) {
      return res.status(404).send({
        message: 'No Review with that identifier has been found'
      });
    }
    req.review = review;
    next();
  })
}