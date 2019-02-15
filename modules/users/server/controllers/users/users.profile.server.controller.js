'use strict';

/**
 * Module dependencies.
 */
const _ = require('lodash')
const fs = require('fs')
const path = require('path')
const errorHandler = require(path.resolve('./modules/core/server/controllers/errors.server.controller'))
const EthService = require(path.resolve('./modules/eth/server/services/eth.server.service'))  
const mongoose = require('mongoose')
const multer = require('multer')
const config = require(path.resolve('./config/config'))
const User = mongoose.model('User')
const Store = mongoose.model('Store')
const curl = new (require('curl-request'))()
const async = require('async')

/**
 * Update user details
 */
exports.update = function (req, res) {
  // Init Variables
  var user = req.user;

  // For security measurement we remove the roles from the req.body object
  // For for test, commented it out
  // delete req.body.roles;

  if (user) {
    // Merge existing user
    user = _.extend(user, req.body);
    user.updated = Date.now();
    user.displayName = user.firstName + ' ' + user.lastName;
    // TODO: remove this hack asap. we shouldn't need to force set terms and conditions this way
    // user.termsAndConditions = true

    user.save(function (err) {
      if (err) {
        return res.status(400).send({
          message: errorHandler.getErrorMessage(err)
        });
      } else {
        req.login(user, function (err) {
          if (err) {
            res.status(400).send(err);
          } else {
            res.json(user);
          }
        });
      }
    });
  } else {
    res.status(400).send({
      message: 'User is not signed in'
    });
  }
};


// exports.getBalances = function (req, res) {
//   // Init Variables
//   var user = req.user

//   let etherBalance
//   let tokenBalance

//   console.log('for wallet: ' + user.publicKey)
//   EthService.getEtherBalance(user.publicKey)
//   .then((balance) => {
//     etherBalance = balance
//     EthService.getTokenBalance(user.publicKey) 
//     .then((balance) => {
//       tokenBalance = balance
//       res.json({ etherBalance: etherBalance, tokenBalance: tokenBalance })
//     })
//     .catch((err) => {
//       res.json(err)
//     })
//   })
//   .catch((err) => {
//     res.json(err)
//   })    

// }

exports.createAccount = function (req, res) {
  // Init Variables
  var user = req.user

  EthService.createAccount2('clippers')
  .then((wallet) => {
      EthService.initUser(wallet)
      res.json({ newAccount: wallet })
  })
  .catch((err) => {
    res.json(err)
  }) 

}

/**
 * Update profile picture
 */
exports.changeProfilePicture = function (req, res) {
  
  var user = req.user;
  var message = null;
  var upload = multer(config.uploads.profileUpload).single('newProfilePicture');
  var profileUploadFileFilter = require(path.resolve('./config/lib/multer')).imageUploadFileFilter;
  
  // Filtering to upload only images
  upload.fileFilter = profileUploadFileFilter;

  if (user) {
    upload(req, res, function (uploadError) {
      if(uploadError) {
        return res.status(400).send({
          message: 'Error occurred while uploading profile picture'
        });
      } else {
        user.profileImageURL = config.uploads.profileUpload.dest + req.file.filename;

        user.save(function (saveError) {
          if (saveError) {
            return res.status(400).send({
              message: errorHandler.getErrorMessage(saveError)
            });
          } else {
            req.login(user, function (err) {
              if (err) {
                res.status(400).send(err);
              } else {
                res.json(user);
              }
            });
          }
        });
      }
    });
  } else {
    res.status(400).send({
      message: 'User is not signed in'
    });
  }
};

/**
 * Get Access token from code for Instagram
 */
exports.saveIgCode = (req, res, next) => {

  if(!req.body.igCode || req.user.igAccessToken !== '') {
    return next()
  }

  curl.setHeaders([
    'Content-Type: application/x-www-form-urlencoded'
  ])
  curl.setBody({
    'client_id': config.instagram.clientId,
    'client_secret':config.instagram.clientSecret,
    'grant_type':'authorization_code',
    'redirect_uri':req.body.redirectUri,
    'code': req.body.igCode
  }).post('https://api.instagram.com/oauth/access_token')
  .then(({statusCode, body, headers}) => {

    if(statusCode === 400) {
      return res.status(400).send({
        message: JSON.parse(body).error_message
      });
    }
    let igInfo = JSON.parse(body)
    req.body.igAccessToken = igInfo.access_token
    req.body.profileImageURL = igInfo.user.profile_picture
    req.body.instagramUsername = igInfo.user.username
    next()
    
  }).catch(e => {
    console.log(e)
    return res.status(400).send({ e })
  })
}

exports.getBackgroundImage = (req, res) => {
  console.log('exports.get background image')
  console.log(req.user)
  if(req.user.igAccessToken === '') {
    return res.status(400).send({
      message: 'Instagram is not connected with this account'
    })
  }

  let getProfileUrl = 'https://api.instagram.com/v1/users/self/media/recent/?access_token=' + req.user.igAccessToken
  let imageUrl = []
  curl.get(getProfileUrl)
  .then(({statusCode, body}) => {
    if(statusCode !== 200) {
      return res.status(parseInt(statusCode)).send({
        message: body.error_message
      })
    }
      let posts = JSON.parse(body).data
      async.each(posts, (post, callback) => {
        imageUrl.push(post.images.standard_resolution.url)
        callback()
      }, (err) => {
        if(err) {
          return res.status(400).send({
            message: errorHandler.getErrorMessage(err)
          })
        } else {
          res.jsonp(imageUrl)
        }
      })
  })
  .catch(err => {
    console.log(err)
    return res.status(400).send({
      message: errorHandler.getErrorMessage(err)
    })
  })
}

function findDuplicateIgUsers(igUserId) {

}

/**
 * Send User
 */
exports.me = function (req, res) {
  res.json(req.user || null);
};
