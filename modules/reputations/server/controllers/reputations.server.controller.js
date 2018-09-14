'use strict';

/**
 * Module dependencies.
 */
var path = require('path'),
  mongoose = require('mongoose'),
  Reputation = mongoose.model('Reputation'),
  errorHandler = require(path.resolve('./modules/core/server/controllers/errors.server.controller')),
  async = require('async'),  
  EthService = require(path.resolve('./modules/eth/server/services/eth.server.service')),    
  _ = require('lodash');

/**
 * Create a Reputation
 */
exports.create = function(req, res) {
  var reputation = new Reputation(req.body);

  EthService.createReputation(reputation)
    .then((result) => {
      console.log('create arbitration contract result..' + result)    
      reputation.save(function(err) {
        if (err) {
          return res.status(400).send({
            message: errorHandler.getErrorMessage(err)
          });
        } else {
          res.jsonp(reputation);
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
 * Show the current Reputation
 */
exports.read = function(req, res, next) {
  // convert mongoose document to JSON
  var tmpReputation = req.reputation;
  console.log('temp reputation')
  console.log(tmpReputation)
  EthService.getReputationInfoByWallet(tmpReputation.wallet)
     .then((fields) => {
      console.log('successful get reputation info')
      console.log(fields)
      let rep = {
          wallet: fields[0],
          average: fields[1],
          ratesCount: fields[2],
          rates: []
          }
      // res.jsonp(rep) 
      req.reputation =  rep
      next()
    })
    .catch((err) => {
      return res.jsonp(err)  
    })  

}

// bind the rate details
exports.bindRateDetail = function(req, res) {

  let reputation = req.reputation
  console.log(reputation)

  async.times(parseInt(reputation.ratesCount), (index, callback) => {    
    console.log('index:' + index)
    EthService.getRateInfoByWalletAndIndex(reputation.wallet, index)
    .then((fields) => {
      console.log('fields')
      console.log(fields)
      reputation.rates.push({
        rate: fields[0],
        from: fields[1],
        date: fields[2]
        })
      callback()
    })
    .catch((err) => {
      console.log(err)
      callback(err)
    })
  }, (err) => {
    if (err) {
      return res.status(400).send({
        message: errorHandler.getErrorMessage(err)
      });
    } else {
      res.jsonp(reputation);
    }
  })

}


/**
 * Update a Reputation
 */
exports.update = function(req, res) {
  var reputation = req.reputation;

  reputation = _.extend(reputation, req.body);

  reputation.save(function(err) {
    if (err) {
      return res.status(400).send({
        message: errorHandler.getErrorMessage(err)
      });
    } else {
      res.jsonp(reputation);
    }
  });
};

/**
 * Delete an Reputation
 */
exports.delete = function(req, res) {
  var reputation = req.reputation;

  reputation.remove(function(err) {
    if (err) {
      return res.status(400).send({
        message: errorHandler.getErrorMessage(err)
      });
    } else {
      res.jsonp(reputation);
    }
  });
};

/**
 * List of Reputations
 */
exports.list = function(req, res) {


  let reputations = []

  EthService.getReputationsLength()
  .then((length) => {
    console.log('number of reputations ' + length)
    async.times(parseInt(length), (index, callback) => {    
      console.log('index:' + index)
      EthService.getReputationInfoByIndex(index)
      .then((fields) => {
        console.log('resturn data')
        console.log(fields)
        reputations.push({
          wallet: fields[0],
          average: fields[1],
          ratesCount: fields[2],
          })
        callback()
      })
      .catch((err) => {
        console.log(err)
        callback(err)
      })  
    }, (err) => {
      if (err) {
        return res.status(400).send({
          message: errorHandler.getErrorMessage(err)
        });
      } else {
        console.log(reputations)
        res.jsonp(reputations)
      }      
    })
  })
  .catch((err) => {
    res.jsonp(err)
  })  


}

/**
 * Reputation middleware
 */
exports.reputationByID = function(req, res, next, id) {
    console.log('repuation middleware wallet ' + id)
    req.reputation = { wallet: id };
    next();


  // if (!mongoose.Types.ObjectId.isValid(id)) {
  //   return res.status(400).send({
  //     message: 'Reputation is invalid'
  //   });
  // }

  // Reputation.findById(id).populate('user', 'displayName').exec(function (err, reputation) {
  //   if (err) {
  //     return next(err);
  //   } else if (!reputation) {
  //     return res.status(404).send({
  //       message: 'No Reputation with that identifier has been found'
  //     });
  //   }
    // req.reputation = reputation;
    // next();
  // })
}
