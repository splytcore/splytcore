'use strict';

/**
 * Module dependencies.
 */
var path = require('path'),
  errorHandler = require(path.resolve('./modules/core/server/controllers/errors.server.controller')),
  EthService = require(path.resolve('./modules/eth/server/services/eth.server.service')),  
  mongoose = require('mongoose'),
  passport = require('passport'),  
  User = mongoose.model('User')

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
  delete req.body.roles

  // Init Variables
  var user = new User(req.body)
  var message = null

  // Add missing user fields
  user.provider = 'local';
  user.displayName = user.firstName + ' ' + user.lastName

  let account = EthService.createAccount()
  console.log('account')
  console.log(account)
      // Then save the user
  user.publicKey = account.address
  user.privateKey = account.privateKey

  user.save(function (err) {
    if (err) {
      return res.status(400).send({
        message: errorHandler.getErrorMessage(err)
      });
    } else {
      // Remove sensitive data before login
      user.password = undefined
      user.salt = undefined

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
          res.json({ user: user, sessionId: cookies.sessionId })
        }
      })
    }
  })(req, res, next)
}

/**
 * Signout
 */
exports.signout = function (req, res) {
  req.logout()
  res.redirect('/')
};