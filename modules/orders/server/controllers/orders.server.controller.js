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

  EthService.purchase(order)
    .on('transactionHash', (hash) => {
      order.transactionHash = hash
      order.save(function(err) {
        if (err) {
          return res.status(400).send({
            message: errorHandler.getErrorMessage(err)
          });
        } else {
          res.jsonp(order);
        }
      })
    }) 
    .on('error', (err) => {
      return res.status(400).send({
        message: 'error creating purchase'
      })
    }
  )

}

/**
 * Show the current Order
 */
exports.read = function(req, res) {
  // convert mongoose document to JSON
  var tmpOrder = req.order ? req.order.toJSON() : {};

  // Add a custom field to the Article, for determining if the current User is the "owner".
  // NOTE: This field is NOT persisted to the database, since it doesn't exist in the Article model.
  // order.isCurrentUserOwner = req.user && order.user && order.user._id.toString() === req.user._id.toString();

  EthService.getOrderInfoByOrderId(tmpOrder._id)
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
      let order = {
        version: fields[0],
        _id: fields[1].substr(2),
        assetAddress: fields[2],
        buyerWallet: fields[3],
        quantity: fields[4],
        trxAmount: fields[5],
        status: fields[6]
      }

      res.jsonp(order)  
    })
    .catch((err) => {
      res.jsonp(err)  
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

  let listPending = req.query.listPending ? req.query.listPending.toString() : null

  if (listPending.indexOf('true') > -1) {
    exports.listPending(req, res)
  } else {
    exports.listMined(req,res)
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
            console.log('blockNunmber')
            console.log(result.blockNumber)
            // return (address(asset), asset.assetId(), asset.status(), asset.term(), asset.inventoryCount(), asset.seller(), asset.totalCost());
            let blockNumber = result.blockNumber ? parseInt(result.blockNumber) : 0
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

exports.listMined = function(req, res) {


  let wallet = req.query.wallet ? req.query.wallet.toUpperCase() : null
  console.log('wallet: ' + wallet)
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

        if (!req.query.wallet || wallet.indexOf(buyerWallet) > -1) {
          orders.push({
            version: fields[0],
            _id: fields[1].substr(2),
            asset: fields[2],
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
