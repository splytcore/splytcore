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
const jdenticon = require('jdenticon')
const fs = require('fs')
const crypto = require('crypto-js')
const axios = require('axios')

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
  var user = new User(req.body)
  var message = null

  // Add missing user fields
  user.provider = 'local';
  user.displayName = user.firstName + ' ' + user.lastName
  EthService.createAccount2(user.password)
  .then((wallet) => {
    console.log('account')
    console.log(wallet)
    EthService.initUser(wallet) //give default number of tokens for DEV ONLY
    .on('transactionHash', (hash) => {
      console.log('trx for giving tokens: ' + hash)
    }) 
    .on('error', (err) => {
      console.log('error giving tokens')
      console.log(err)
    })
    // Get 1 test ether
    axios.get('https://faucet.ropsten.be/donate/' + wallet)
    
    user.profileImageURL = './modules/users/client/img/profile/' + user.id + '.png'
    // Generate avatar based on wallet address
    fs.writeFileSync(user.profileImageURL, jdenticon.toPng(user.wallet, 200))

    user.publicKey = wallet
    user.walletPassword = user.password
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
  })
  .catch((err) => {
    res.status(400).send(err)
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
  let user = req.user
  req.logout()
  res.redirect('/')
};