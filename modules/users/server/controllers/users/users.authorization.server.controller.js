'use strict';

/**
 * Module dependencies.
 */
const _ = require('lodash')
const mongoose = require('mongoose')
const User = mongoose.model('User')
const cryptojs = require('crypto-js')
const EthService = require('../../../../eth/server/services/eth.server.service')
const AssetService = require('../../../../assets/server/services/assets.server.service')



/**
 * User middleware
 */
exports.userByID = function(req, res, next, id) {  
  if (!mongoose.Types.ObjectId.isValid(id)) {
    return res.status(400).send({
      message: 'User is invalid'
    });
  }

  User.findOne({
    _id: id
  }).exec(function (err, user) {
    if (err) {
      return next(err);
    } else if (!user) {
      return next(new Error('Failed to load User ' + id));
    }
    req.profile = user;
    next();
  });
};

exports.getWalletPassword = function(req, res, next) {
  User.findOne({
    _id: req.user.id
  }).exec(function (err, user) {
    if (err) {
      return next(err);
    } else if (!user) {
      return res.status(400).send({
        message: 'User is invalid'
      })
    }
    
    var bytePassword =  cryptojs.AES.decrypt(user.walletPassword, process.env.sessionSecret)
    req.walletPassword = bytePassword.toString(cryptojs.enc.Utf8)
    next()
  });
}


exports.mockUser = function(req, res, next) {
  User.findById('5d758e367a62abec44b8bc13').exec((err, user) => {
    console.log('user', user)
    console.log('err', err)
    req.user = user
    EthService.getTokenBalance(user.publicKey)
    .then(tokenBalance => {
      req.tokenBalance = AssetService.decorateTokenBalance(tokenBalance)
      next()
    })
    .catch(err => {
      console.log(err)
      next()
    })
    
  })
}