'use strict';

/**
 * Module dependencies.
 */
var path = require('path'),
  mongoose = require('mongoose'),
  async = require('async'),
  Arbitration = mongoose.model('Arbitration'),
  EthService = require(path.resolve('./modules/eth/server/services/eth.server.service')),    
  errorHandler = require(path.resolve('./modules/core/server/controllers/errors.server.controller')),
  _ = require('lodash');

/**
 * Create a Arbitration
 */
exports.create = function(req, res) {
  
  var arbitration = new Arbitration(req.body);
  arbitration.user = req.user;

  EthService.createArbitration(arbitration)
    .then((result) => {
      console.log('create arbitration contract result..' + result)    
      arbitration.save(function(err) {
        if (err) {
          return res.status(400).send({
            message: errorHandler.getErrorMessage(err)
          });
        } else {
          res.jsonp(arbitration);
        }
      })
    })
    .catch((err) => {
      return res.status(400).send({
        message: 'error creating asset'
      })
    }
  )

}

/**
 * Show the current Arbitration
 */
exports.read = function(req, res) {
  // convert mongoose document to JSON
  var tmpArbitration = req.arbitration ? req.arbitration.toJSON() : {};

  EthService.getArbitrationInfoByArbitrationId(tmpArbitration._id)
     .then((fields) => {
      console.log('successful get order info')
      console.log(fields)

            // 0 orders[_orderId].version,    
            // 1 orders[_orderId].orderId,
            // 2 orders[_orderId].asset,    
            // 3 orders[_orderId].buyer,
            // 4 orders[_orderId].quantity,
            // 5 orders[_orderId].paidAmount,
            // 6 orders[_orderId].status);
      let a = {
           _id: fields[0].substr(2),
          reason: fields[1],
          reporterWallet: fields[2],
          winner: fields[3],
          status: fields[4],
          assetAddress: fields[5],
          arbitratorWallet: fields[6]
      }

      res.jsonp(a)  
    })
    .catch((err) => {
      res.jsonp(err)  
    })  

}

/**
 * Update a Arbitration
 */
exports.update = function(req, res) {
  var arbitration = req.arbitration;

  arbitration = _.extend(arbitration, req.body);

  arbitration.save(function(err) {
    if (err) {
      return res.status(400).send({
        message: errorHandler.getErrorMessage(err)
      });
    } else {
      res.jsonp(arbitration);
    }
  });
};

/**
 * Delete an Arbitration
 */
exports.delete = function(req, res) {
  var arbitration = req.arbitration;

  arbitration.remove(function(err) {
    if (err) {
      return res.status(400).send({
        message: errorHandler.getErrorMessage(err)
      });
    } else {
      res.jsonp(arbitration);
    }
  });
};

/**
 * List of Arbitrations
 */
exports.list = function(req, res) {
  
  let arbitrations = []
  let wallet = req.query.wallet ? req.query.wallet : null

  EthService.getArbitrationsLength()
  .then((length) => {
    console.log('number of arbs ' + length)
    async.times(parseInt(length), (index, callback) => {    
      console.log('index:' + index)
      EthService.getArbitrationInfoByIndex(index)
      .then((fields) => {
        console.log(fields)
            // 0 a.arbitrationId(), 
            // 1 a.reason(), 
            // 2 a.reporter(), 
            // 3 a.winner(),
            // 4 a.status(), 
            // 5 a.asset(), 
            // 6 a.arbitrator()
        //list if your wallet is participating in the arbitration
        if (!req.query.wallet ||
            (fields[2].indexOf(wallet) > -1 || fields[6].indexOf(wallet) > -1) 
            ) {

          arbitrations.push({
            _id: fields[0].substr(2),
            reason: fields[1],
            reporter: fields[2],
            winner: fields[3],
            status: fields[4],
            assetAddress: fields[5],
            arbitrator: fields[6]
            })
        }
        callback()
      })
      .catch((err) => {
        console.log(err)
        callback(err)
      })  
    }, (err) => {
      console.log('theres an error')
      if (err) {
        return res.status(400).send({
          message: errorHandler.getErrorMessage(err)
        });
      } else {
        console.log(arbitrations)
        res.jsonp(arbitrations)
      }      
    })
  })
  .catch((err) => {
    res.jsonp(err)
  })  

  // Arbitration.find().sort('-created').populate('user', 'displayName').exec(function(err, arbitrations) {
  //   if (err) {
  //     return res.status(400).send({
  //       message: errorHandler.getErrorMessage(err)
  //     });
  //   } else {
  //     res.jsonp(arbitrations);
  //   }
  // });
};

/**
 * Arbitration middleware
 */
exports.arbitrationByID = function(req, res, next, id) {

  if (!mongoose.Types.ObjectId.isValid(id)) {
    return res.status(400).send({
      message: 'Arbitration is invalid'
    });
  }

  Arbitration.findById(id).populate('user', 'displayName').exec(function (err, arbitration) {
    if (err) {
      return next(err);
    } else if (!arbitration) {
      return res.status(404).send({
        message: 'No Arbitration with that identifier has been found'
      });
    }
    req.arbitration = arbitration;
    next();
  });
};
