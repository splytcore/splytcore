'use strict';

/**
 * Module dependencies.
 */
var _ = require('lodash'),
  fs = require('fs'),
  path = require('path'),
  errorHandler = require(path.resolve('./modules/core/server/controllers/errors.server.controller')),
  EthService = require(path.resolve('./modules/eth/server/services/eth.server.service')),  
  mongoose = require('mongoose'),
  multer = require('multer'),
  config = require(path.resolve('./config/config')),
  User = mongoose.model('User');
const jdenticon = require('jdenticon')

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


exports.getBalances = function (req, res) {
  // Init Variables
  var user = req.user

  let etherBalance
  let tokenBalance

  console.log('for wallet: ' + user.publicKey)
  EthService.getEtherBalance(user.publicKey)
  .then((balance) => {
    etherBalance = balance
    EthService.getTokenBalance(user.publicKey) 
    .then((balance) => {
      tokenBalance = balance
      res.json({ etherBalance: etherBalance, tokenBalance: tokenBalance })
    })
    .catch((err) => {
      res.json(err)
    })
  })
  .catch((err) => {
    res.json(err)
  })    

}

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

exports.resetProfilePicture = function (req, res) {
  var profileImageURL = './modules/users/client/img/profile/' + req.user.id + '.png'
  // Generate avatar based on wallet address
  fs.writeFileSync(req.user.profileImageURL, jdenticon.toPng(req.user.wallet, 200))

  User.findOneAndUpdate(
    { _id: req.user.id }, 
    { $set:{ profileImageURL: profileImageURL }}, 
    { new: true }, (err, user) => {
      if(err)
        return res.status(400).send(err)
      res.json(user)
    })
}

/**
 * Send User
 */
exports.me = function (req, res) {
  res.json(req.user || null);
};
