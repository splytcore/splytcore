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
  _ = require('lodash')

const Asset = mongoose.model('Asset')
const config = require('../../../../config/config')
const nodemailer = require('nodemailer')
const smtpTransport = nodemailer.createTransport(config.mailer.options)


/**
 * Create a Arbitration
 */
exports.create = function(req, res, next) {
  
  var arbitration = new Arbitration(req.body)
  arbitration.user = req.user;

  EthService.createArbitration(arbitration)
    .on('transactionHash', (hash) => {
      console.log('trxHash: ' + hash)
      arbitration.transactionHash = hash
      arbitration.save(function(err) {
        if (err) {
          return res.status(400).send({
            message: errorHandler.getErrorMessage(err)
          });
        } else {
          req.arbitration = arbitration
          next()
        }
      })
    }) 
    .on('error', (err) => {
      console.log('error creating arbitration contract')
      console.log(err)
      return res.status(400).send({ message : err.toString() })      
    }
  )

}

exports.mockArbitration = function(req, res, next) {
  var assetId = req.body.assetId
  Asset.findById(assetId).exec( (err, asset) => {
    if(err)
      return res.status(400).send({ message: errorHandler.getErrorMessage(err)})

    req.body.reporterWallet = req.user.publicKey
    req.body.reason = 1
    req.asset = asset
    EthService.getAssetInfoByAssetId(asset._id)
    .then(info => {
      console.log('Info from asset manager', info)
      req.body.assetAddress = info[0]
      EthService.getStakeAmount(info[7])
      .then(stakeAmount => {
        console.log(stakeAmount)
        req.stakeAmount = stakeAmount
        next()
      })
      .catch(err => {
        console.log(err)
        req.stakeAmount = 120
        next()
      })
    })
    .catch(err => {
      console.log('Err: ', err)
      next()
    })
  })
}

exports.sendDisputeEmail = function(req, res) {

  console.log('mailer options: ', config.mailer)
  var httpTransport = 'http://';
  if (config.secure && config.secure.ssl === true) {
    httpTransport = 'https://';
  }
  res.render(path.resolve('modules/users/server/templates/disputed-item-email'), {
    userName: 'Cyrus',
    tokenBalance: req.tokenBalance,
    stakeAmount: req.stakeAmount,
    arbitrationId: '5da4c3902ea4ca4e799fa054',
    assetName: req.asset.title,
    url: httpTransport + req.headers.host + '/arbitrations/' + req.arbitration._id + '/set2xStakeBySeller'
  }, (err, emailHTML) => {
    if(err)
      console.log(err)
    var mailOptions = {
      to: 'josh@spl.yt',
      from: config.mailer.from,
      subject: 'Splyt Support Team - Disputed Item',
      html: emailHTML
    }
    smtpTransport.sendMail(mailOptions, err => {
      if (err) {
        console.log(err)
        return res.status(400).send({
          message: 'Failure sending email',
          err: err
        }); 
      }
      res.json(req.arbitration)
    })
  })
}

/**
 * Show the current Arbitration
 */
exports.read = function(req, res) {
  // convert mongoose document to JSON
  var arbitration = req.arbitration ? req.arbitration.toJSON() : {};

  EthService.getArbitrationInfoByArbitrationId(arbitration._id)
     .then((fields) => {
      console.log('successful get arbitgration info')
      console.log(fields)

            // 0 orders[_orderId].version,    
            // 1 orders[_orderId].orderId,
            // 2 orders[_orderId].asset,    
            // 3 orders[_orderId].buyer,
            // 4 orders[_orderId].quantity,
            // 5 orders[_orderId].paidAmount,
            // 6 orders[_orderId].status);
      arbitration.reason = fields[1]
      arbitration.eporterWallet = fields[2]
      arbitration.winner = fields[3]
      arbitration.status = fields[4]
      arbitration.assetAddress = fields[5]
      arbitration.arbitratorWallet = fields[6]
      res.jsonp(arbitration)
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

exports.setArbitrator = function(req, res) {
  
  let arbId = req.params.arbitrationId
  let arbitrator = req.user.publicKey

  EthService.setArbitrator(arbId, arbitrator)
    .on('transactionHash', (hash) => {
      console.log('trxHash: ' + hash)
      res.jsonp(hash);
    }) 
    .on('error', (err) => {
      console.log('error setting arbitrator')
      console.log(err)
      return res.status(400).send({ message : err.toString() })
    }
  )
}

exports.set2xStakeByReporter = function(req, res) {
  
  let reporter = req.user.publicKey
  let arbId = req.params.arbitrationId

  EthService.set2xStakeByReporter(arbId, reporter)
    .on('transactionHash', (hash) => {
      console.log('trxHash: ' + hash)
      res.jsonp(hash);
    }) 
    .on('error', (err) => {
      console.log(err)
      return res.status(400).send({ message : err.toString() })      
    }
  )

}

exports.set2xStakeBySeller = function(req, res) {
  
  let seller = req.user.publicKey
  let arbId = req.params.arbitrationId

  EthService.set2xStakeBySeller(arbId, seller)
    .on('transactionHash', (hash) => {
      console.log('trxHash: ' + hash)
      res.jsonp(hash);
    }) 
    .on('error', (err) => {
      console.log(err)
      return res.status(400).send({ message : err.toString() })      
    }
  )

}

exports.setWinner = function(req, res) {
  
  let arbitrator = req.user.publicKey
  let arbId = req.params.arbitrationId
  let winner = req.body.winner

  EthService.setWinner(arbId, arbitrator, winner)
    .on('transactionHash', (hash) => {
      console.log('trxHash: ' + hash)
      res.jsonp(hash);
    }) 
    .on('error', (err) => {
      console.log(err)
      return res.status(400).send({ message : err.toString() })      
    }
  )

}
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

  let listType = req.query.listType ? req.query.listType.toUpperCase() : null
  
  console.log(listType)

  switch(listType) {
      case 'ARBITRATIONS.LISTPENDING':
          exports.listPending(req,res)
          break
      case 'ARBITRATIONS.LIST':
           exports.listAllMined(req,res)
          break
      case 'ARBITRATIONS.LISTMYARBITRATIONS':
           exports.ListMyArbitrations(req,res)
          break                       
      default:
           exports.listAllMined(req,res)
  }
    
}

exports.listPending = function(req, res) {

  Arbitration.find().sort('-created').populate('user', 'displayName').exec(function(err, arbitrations) {
    if (err) {
      return res.status(400).send({
        message: errorHandler.getErrorMessage(err)
      });
    } else {
      let pendingArbitrations = []
      async.each(arbitrations, (arbitration, callback) => {    
        console.log('trxHash:' + arbitration.transactionHash)
        if (arbitration.transactionHash) {
          EthService.getTransaction(arbitration.transactionHash)
          .then((result) => {
            // console.log('blockNunmber')
            // console.log(result.blockNumber)
            // return (address(asset), asset.assetId(), asset.status(), asset.term(), asset.inventoryCount(), asset.seller(), asset.totalCost());
            let blockNumber = result && result.blockNumber ? parseInt(result.blockNumber) : 0
            if (blockNumber === 0) {
              pendingArbitrations.push(arbitration)
            }
            callback()
          })
          .catch((err) => {
            console.log(err)
            callback(err)
          })  
        } else {
          callback()
        }
      }, (err) => {
        if (err) {
          return res.status(400).send({
            message: errorHandler.getErrorMessage(err)
          });
        } else {
          res.jsonp(pendingArbitrations);
        }      
      })
    }
  })    
}

exports.listAllMined = function(req, res) {
  
  console.log('listing all mined')
  let arbitrations = []

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
        arbitrations.push({
          _id: fields[0].substr(2),
          reason: fields[1],
          reporter: fields[2],
          winner: fields[3],
          status: fields[4],
          assetAddress: fields[5],
          arbitrator: fields[6],
          contractAddress: fields[7]
          })
        callback()
      })
      .catch((err) => {
        console.log('error fetching arbitrations')
        console.log(err)
        callback(err)
      })  
    }, (err) => {
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
    console.log(err)
    res.jsonp(err)
  })  

}



exports.ListMyArbitrations = function(req, res) {
  
  let arbitrations = []
  let myWallet = req.user.publicKey

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
        let reporter  = fields[2].toUpperCase() 
        let arbitrator  = fields[6].toUpperCase() 

        if (arbitrator.indexOf(myWallet) > -1 || reporter.indexOf(myWallet) > -1) {

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
