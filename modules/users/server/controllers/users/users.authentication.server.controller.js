'use strict';

/**
 * Module dependencies.
 */
const path = require('path')
const errorHandler = require(path.resolve('./modules/core/server/controllers/errors.server.controller'))
const EthService = require(path.resolve('./modules/eth/server/services/eth.server.service'))
const mongoose = require('mongoose')
const passport = require('passport') 
const User = mongoose.model('User')
const Preregistration = mongoose.model('Preregistration')

const config = require(path.resolve('./config/config'))
const nodemailer = require('nodemailer')
const smtpTransport = nodemailer.createTransport(config.mailer.options)
const async = require('async') 

// URLs for which user can't be redirected on signin
var noReturnUrls = [
  '/authentication/signin',
  '/authentication/signup'
];

/**
 * Signup
 */
exports.signup = function (req, res) {

  // For security measurement we remove the roles from the req.body object  
  // IMPORTANT! Commented out for DEV.
  // delete req.body.roles

  // Init Variables
  let user = new User(req.body)
  let message = null
  let signupToken =req.body.signupToken

  // Add missing user fields
  user.provider = 'local';
  user.displayName = user.firstName + ' ' + user.lastName
  user.save(function (err) {
    if (err) {
      return res.status(400).send({
        message: errorHandler.getErrorMessage(err)
      });
    } else {
      // Remove sensitive data before login
      user.password = undefined
      user.salt = undefined
      
      // emailSignup(res, user)
      setSignupTokenRedeemed(signupToken, user)
      
      req.login(user, function (err) {
        if (err) {
          res.status(400).send(err)
        } else {
          res.json(user)
        }
      })
    }
  })

}

function setSignupTokenRedeemed(token, user) {

  console.log('updating signup token: ' + token)

  Preregistration.findOneAndUpdate({ signupToken: token }, { signupUser: user, signupDate: Date.now() }).exec()
    .then((result) => {
      console.log('signupToken updated')
    })
    .catch((err) => {
      console.log(err)
    })

}

/**
 * check if token is valid
 */
exports.verifySignupToken = function(req, res, next) {

  let token = req.body.signupToken
  
  Preregistration.findOne({ signupToken: token }).exec()
    .then((pre) => {
      if (!pre) {
        return res.status(400).send({
          message: 'Sorry, that token is invalid.'
        })        
      }

      if (pre.signupUser) {
        return res.status(400).send({
          message: 'Sorry, this token has been already been used'
        })    
      } 

      next()
    })
    .catch((err) => {
      return res.status(400).send({
        message: err.toString()
      })  
    })      
}

function emailSignup(res, user) {

  async.waterfall([
    function prepEmail(done) {
      var httpTransport = 'http://'
      if (config.secure && config.secure.ssl === true) {
        httpTransport = 'https://'
      }
      res.render(path.resolve('modules/users/server/templates/signup-email'), {
        name: user.displayName,
        appName: config.app.title
      }, function (err, emailHTML) {
        done(err, emailHTML);
      });
    },
    function sendIt(emailHTML, done) {
      var mailOptions = {
        to: user.email,
        from: config.mailer.from,
        subject: 'Welcome to Pollenly!',
        html: emailHTML
      }
      smtpTransport.sendMail(mailOptions, function (err) {
        done(err);
      });
    }
  ], function (err) {
    if (err) {
      console.log(err)
    }
  })

}

/**
 * Signin after passport authentication
 */
exports.signin = function (req, res, next) {
  passport.authenticate('local', function (err, user, info) {
    if (err || !user) {
      res.status(400).send(info)
    } else {
      // Remove sensitive data before login
      user.password = undefined;
      user.salt = undefined;
      req.login(user, (err) =>  {
        if (err) {
          res.status(400).send(err)
        } else {            
          let cookies = req.cookies   
          console.log(cookies.sessionId)       
          res.json({ 
            user: user, 
            sessionId: cookies.sessionId 
          })
        }
      })
    }
  })(req, res, next)
}

/**
 * Signout
 */
exports.signout = function (req, res) {
  let user = req.user
  req.logout()
  res.redirect('/')
};