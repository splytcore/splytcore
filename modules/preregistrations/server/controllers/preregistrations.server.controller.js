'use strict';

/**
 * Module dependencies.
 */
const path = require('path')
const mongoose = require('mongoose')
const Preregistration = mongoose.model('Preregistration')
const errorHandler = require(path.resolve('./modules/core/server/controllers/errors.server.controller'))
const _ = require('lodash')

const async = require('async') 
const config = require(path.resolve('./config/config'))
const nodemailer = require('nodemailer')
const smtpTransport = nodemailer.createTransport(config.mailer.options)

/**
 * Create a Preregistration
 */
exports.create = function(req, res) {
  
  console.log('create a prerejecstration')
  var preregistration = new Preregistration(req.body);
  preregistration.user = req.user;

  preregistration.save()
    .then(() => {
      res.jsonp(preregistration)
    })
    .catch((err) => {
      return res.status(400).send({
        message: errorHandler.getErrorMessage(err)
      })      
    })
}

/**
 * Show the current Preregistration
 */
exports.read = function(req, res) {
  // convert mongoose document to JSON
  var preregistration = req.preregistration ? req.preregistration.toJSON() : {};

  // Add a custom field to the Article, for determining if the current User is the "owner".
  // NOTE: This field is NOT persisted to the database, since it doesn't exist in the Article model.
  preregistration.isCurrentUserOwner = req.user && preregistration.user && preregistration.user._id.toString() === req.user._id.toString();

  res.jsonp(preregistration);
};

/**
 * Update a Preregistration
 */
exports.update = function(req, res) {
  var preregistration = req.preregistration;

  preregistration = _.extend(preregistration, req.body);

  preregistration.save(function(err) {
    if (err) {
      return res.status(400).send({
        message: errorHandler.getErrorMessage(err)
      });
    } else {
      res.jsonp(preregistration);
    }
  });
};

/**
 * Send invite
 */
exports.sendInvite = function(req, res) {

  var preregistration = req.preregistration;

  preregistration.inviteSentDate = new Date()

  preregistration.save(function(err) {
    if (err) {
      return res.status(400).send({
        message: errorHandler.getErrorMessage(err)
      });
    } else {
      emailInvite(req, res, preregistration);
      res.jsonp(preregistration);
    }
  });
};


function emailInvite(req, res, pre) {

  async.waterfall([
    function prepEmail(done) {
      var httpTransport = 'http://'
      if (config.secure && config.secure.ssl === true) {
        httpTransport = 'https://'
      }
      res.render(path.resolve('modules/preregistrations/server/templates/invite-email'), {
        name: pre.name,
        appName: config.app.title,
        email: pre.email,
      }, function (err, emailHTML) {
        done(err, emailHTML);
      });
    },
    // If valid email, send reset email using service
    function sendIt(emailHTML, done) {
      var mailOptions = {
        to: pre.email,
        from: config.mailer.from,
        subject: 'You Have Been Invited! - Pollenly',
        html: emailHTML
      }
      smtpTransport.sendMail(mailOptions, function (err) {
        done(err);
      });
    }
  ], function (err) {
    if (err) {
      console.log(err)
    } else {
      console.log('invite sent')      
    }
  })
      

}

/**
 * Delete an Preregistration
 */
exports.delete = function(req, res) {
  var preregistration = req.preregistration;

  preregistration.remove(function(err) {
    if (err) {
      return res.status(400).send({
        message: errorHandler.getErrorMessage(err)
      });
    } else {
      res.jsonp(preregistration);
    }
  });
};

/**
 * List of Preregistrations
 */
exports.list = function(req, res) {
  Preregistration.find().sort('-created').populate('user', 'displayName').exec(function(err, preregistrations) {
    if (err) {
      return res.status(400).send({
        message: errorHandler.getErrorMessage(err)
      });
    } else {
      res.jsonp(preregistrations);
    }
  });
};

/**
 * is email in preregistration
 */
exports.isInvited = function(req, res, next) {

  let email = req.body.email

  Preregistration.count({ email: email }).exec(function(err, count) {
    if (err) {
      return res.status(400).send({
        message: errorHandler.getErrorMessage(err)
      });
    } 
    if (count > 0) {
      next()
    } else {
      return res.status(400).send({
        message: 'Sorry, only invitees are allowed to signup.'
      })
    }
  })
}

/**
 * Preregistration middleware
 */
exports.preregistrationByID = function(req, res, next, id) {

  if (!mongoose.Types.ObjectId.isValid(id)) {
    return res.status(400).send({
      message: 'Preregistration is invalid'
    });
  }

  Preregistration.findById(id).populate('user', 'displayName').exec(function (err, preregistration) {
    if (err) {
      return next(err);
    } else if (!preregistration) {
      return res.status(404).send({
        message: 'No Preregistration with that identifier has been found'
      });
    }
    req.preregistration = preregistration;
    next();
  });
};
