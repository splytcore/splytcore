'use strict';

/**
 * Module dependencies.
 */
var path = require('path'),
  mongoose = require('mongoose'),
  Order = mongoose.model('Order'),
  async = require('async'),  
  errorHandler = require(path.resolve('./modules/core/server/controllers/errors.server.controller')),
  EthService = require(path.resolve('./modules/eth/server/services/eth.server.service')),  
  _ = require('lodash');

/**
 * Create a Order
 */
exports.create = function(req, res) {

  console.log('creating order')

  var order = new Order(req.body)
  order.user = req.user

  console.log(order.assetAddress)

  async.waterfall([
      function fractionOrderExists(callback) {
        EthService.isFractionalOrderExists(order.assetAddress)
          .then((exists) => {
            console.log('does a fractional order exist? ' + exists)
            if (exists.toString().indexOf('false') > -1) {
              callback(null, order, false)
            } else {
              callback(null, order, true)
            }
          })
          .catch((err) => {
            callback(err)
          })    
      },      
      function purchase(order, fractionalOrderExists, callback) {
        EthService.purchase(order)
          .on('transactionHash', (hash) => {
            order.transactionHash = hash
            //If there's already an order, do no generate a new record in mongodb
            callback(null, order, fractionalOrderExists)
          }) 
          .on('error', (err) => {
            console.log('error creating order')
            console.log(err)
            callback(err)
          })        
      },      
      //creates a new record only if a asset type is normal or there have been no contributions for fractional asset
      function createDB(order, fractionalOrderExists, callback) {
        if (fractionalOrderExists) {
            callback(null, order)
        } else {
          order.save((err) => {
            callback(err, order)
          })
        }
      }
  ], function (err, order) {
    if (err) {
      return res.status(400).send({
        message: err.toString()
      });
    } else {
      res.jsonp(order);
    }         
  })

}


exports.requestRefund = function(req, res) {

  console.log('requesting refund')

  let order = req.order
  let user = req.user

  EthService.requestRefund(order._id, user.publicKey)
    .on('transactionHash', (hash) => {
      // order.transactionHash = hash
      res.jsonp(hash);
    }) 
    .on('error', (err) => {
      console.log('error requesting refund')
      console.log(err)
      return res.status(400).send({ message : err.toString() })      
    }
  )

}


exports.approveRefund = function(req, res) {

  console.log('requesting refund')

  let order = req.order
  let user = req.user

  EthService.approveRefund(order._id, user.publicKey)
    .on('transactionHash', (hash) => {
      // order.transactionHash = hash
      res.jsonp(hash);
    }) 
    .on('error', (err) => {
      console.log('error requesting refund')
      console.log(err)
      return res.status(400).send({ message : err.toString() })      
    }
  )

}

/**
 * Show the current Order
 */
exports.read = function(req, res) {
  // convert mongoose document to JSON
  let order = req.order ? req.order.toJSON() : {};

  // Add a custom field to the Article, for determining if the current User is the "owner".
  // NOTE: This field is NOT persisted to the database, since it doesn't exist in the Article model.
  // order.isCurrentUserOwner = req.user && order.user && order.user._id.toString() === req.user._id.toString();

  async.waterfall([
      function getOrderInfoByOrderId(callback) {
        EthService.getOrderInfoByOrderId(order._id)
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
            order.version = fields[0]
            // _id: fields[1].substr(2),
            order.assetAddress = fields[2]
            order.buyerWallet = fields[3]
            order.quantity = fields[4]
            order.trxAmount = fields[5]
            order.status = fields[6]
            callback(null, order)
          })
          .catch((err) => {
            callback(err) 
          })  
      },      
      function getMarketPlaceByOrderId(order, callback) {
        EthService.getMarketPlaceByOrderId(order._id)
           .then((marketPlace) => {
            console.log('successful get market place by order id')
            console.log(marketPlace)
            order.marketPlace = marketPlace
            callback(null, order)
          })
          .catch((err) => {
            callback(err) 
          })  
      },      
      //check if fractional or normal sale. 
      function getContributionsLength(order, callback) {
        EthService.getContributionsLength(order._id)
           .then((length) => {
            console.log('number of conributors: ' + length)
            callback(null, order, parseInt(length))  
          })
          .catch((err) => {
            callback(err)
          })  
     
      },      
      //creates a new record only if a asset type is normal or there have been no contributions for fractional asset
      function fetchContributionsIfFractional(order, contributionsLength, callback) {
        if (parseInt(contributionsLength) === 0)  {
            callback(null, order)
        } else {
          getContributions(order._id, contributionsLength, (err, contributions) => {
            order.contributions = contributions
            callback(err, order)
          })
        }
      }
  ], function (err, order) {
    if (err) {
      console.log(err)
      return res.status(400).send({
        message: err.toString()
      });
    } else {
      res.jsonp(order);
    }         
  })

}

function getContributions(orderId, length, done) {
  console.log('lets get all contributions')  
  let contributions = []

  async.times(parseInt(length), (index, callback) => {    
    console.log('index:' + index)
    EthService.getContributionByOrderIdAndIndex(orderId, index)
    .then((fields) => {
      console.log(fields)
      contributions.push({ contributor: fields[0], amount: fields[1], date: fields[2] })
      callback()
    })
    .catch((err) => {
      console.log(err)
      callback(err)
    })  
  }, (err) => {
    done(err, contributions)   
  })

}

/**
 * Update a Order
 */
exports.update = function(req, res) {
  var order = req.order;

  order = _.extend(order, req.body);

  order.save(function(err) {
    if (err) {
      return res.status(400).send({
        message: errorHandler.getErrorMessage(err)
      });
    } else {
      res.jsonp(order);
    }
  });
};

/**
 * Delete an Order
 */
exports.delete = function(req, res) {
  var order = req.order;

  order.remove(function(err) {
    if (err) {
      return res.status(400).send({
        message: errorHandler.getErrorMessage(err)
      });
    } else {
      res.jsonp(order);
    }
  });
};

/**
 * List of Orders
 */
exports.list = function(req, res) {

  let listType = req.query.listType ? req.query.listType.toUpperCase() : null
  console.log(listType)
  switch(listType) {
      case 'ORDERS.LISTPENDING':
          exports.listPending(req,res)
          break
      case 'ORDERS.LIST':
           exports.listAllMined(req,res)
          break
      case 'ORDERS.LISTMYORDERS':
           exports.listMyOrders(req,res)
          break                       
      default:
           exports.listAllMined(req,res)
  }

}

exports.listPending = function(req, res) {

  Order.find().sort('-created').populate('user', 'displayName').exec(function(err, orders) {
    if (err) {
      return res.status(400).send({
        message: errorHandler.getErrorMessage(err)
      });
    } else {
      let pendingOrders = []
      async.each(orders, (order, callback) => {    
        console.log('trxHash:' + order.transactionHash)
        if (order.transactionHash) {
          EthService.getTransaction(order.transactionHash)
          .then((result) => {
            // console.log('blockNunmber')
            // console.log(result.blockNumber)
            // // return (address(asset), asset.assetId(), asset.status(), asset.term(), asset.inventoryCount(), asset.seller(), asset.totalCost());
            let blockNumber = result && result.blockNumber ? parseInt(result.blockNumber) : 0
            if (blockNumber === 0) {
              pendingOrders.push(order)
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
          res.jsonp(pendingOrders);
        }      
      })
    }
  })    
}

exports.getFromDB = function(req, res, next) {
  
  Order.find().populate('user', 'displayName').exec(function (err, orders) {
    if (err) {
      return next(err)
    } else {
      req.orders = orders;
      next();
    }
  })  
}

exports.getFromContract = function(req, res) {
  
  let orders = req.orders

  async.each(orders, (order, callback) => {    
    EthService.getOrderInfoByOrderId(order._id)
      .then((fields) => {

        console.log(fields)

        order.version = fields[0]
        // _id: fields[1].substr(2),
        order.assetAddress = fields[2]
        order.buyerWallet = fields[3]
        order.quantity = fields[4]
        order.trxAmount = fields[5]
        order.status = fields[6]        
        callback()
      })
      .catch((err) => {
        callback(err)
      })
  }, (err) => {
    if (err) {
      return res.status(400).send({
        message: errorHandler.getErrorMessage(err)
      });
    } else {
      res.jsonp(orders);
    }      
  })
  
}


exports.listAllMined = function(req, res) {

  let orders = []
  EthService.getOrdersLength()
  .then((length) => {
    console.log('number of orders ' + length)
    async.times(parseInt(length), (index, callback) => {    
      console.log('index:' + index)
      EthService.getOrderInfoByIndex(index)
      .then((fields) => {
        console.log(fields)
            // orders[_orderId].version,    
            // orders[_orderId].orderId,
            // orders[_orderId].asset,    
            // orders[_orderId].buyer,
            // orders[_orderId].quantity,
            // orders[_orderId].paidAmount,
            // orders[_orderId].status);

        orders.push({
          version: fields[0],
          _id: fields[1].substr(2),
          assetAddress: fields[2],
          buyerWallet: fields[3],
          quantity: fields[4],
          totalAmount: fields[5],
          status: fields[6]
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
        console.log(orders)
        res.jsonp(orders)
      }      
    })
  })
  .catch((err) => {
    res.jsonp(err)
  })  

}


exports.listMyOrders = function(req, res) {

  let myWallet = req.user.publicKey ? req.user.publicKey.toUpperCase() : null

  console.log('wallet: ' + myWallet)
  let orders = []
  EthService.getOrdersLength()
  .then((length) => {
    console.log('number of orders ' + length)
    async.times(parseInt(length), (index, callback) => {    
      console.log('index:' + index)
      EthService.getOrderInfoByIndex(index)
      .then((fields) => {
        console.log(fields)
            // orders[_orderId].version,    
            // orders[_orderId].orderId,
            // orders[_orderId].asset,    
            // orders[_orderId].buyer,
            // orders[_orderId].quantity,
            // orders[_orderId].paidAmount,
            // orders[_orderId].status);

        let buyerWallet = fields[3].toUpperCase()

        if (myWallet.indexOf(buyerWallet) > -1) {
          orders.push({
            version: fields[0],
            _id: fields[1].substr(2),
            assetAddress: fields[2],
            buyerWallet: fields[3],
            quantity: fields[4],
            totalAmount: fields[5],
            status: fields[6]
            })
        }
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
        console.log(orders)
        res.jsonp(orders)
      }      
    })
  })
  .catch((err) => {
    res.jsonp(err)
  })  

}
/**
 * Order middleware
 */
exports.orderByID = function(req, res, next, id) {

  if (!mongoose.Types.ObjectId.isValid(id)) {
    return res.status(400).send({
      message: 'Order is invalid'
    });
  }

  Order.findById(id).populate('user', 'displayName').exec(function (err, order) {
    if (err) {
      return next(err);
    } else if (!order) {
      return res.status(404).send({
        message: 'No Order with that identifier has been found'
      });
    }
    req.order = order;
    next();
  });
};
