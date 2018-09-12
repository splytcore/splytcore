'use strict';

/**
 * Module dependencies.
 */
var mongoose = require('mongoose'),
  Schema = mongoose.Schema;

/**
 * Order Schema
 */
var OrderSchema = new Schema({
  created: {
    type: Date,
    default: Date.now
  },
  asset: {
    type: Schema.ObjectId,
    ref: 'Asset'
  },
  assetAddress: {
    type: String,
    default: ''
  },
  status: {
    type: Number,
    default: 0
  },    
  type: {
    type: Number,
    default: 0
  },  
  quantity: {
    type: Number,
    default: 1
  },
  totalAmount: {
    type: Number,
    default: 0
  },  
  //buyer wallet
  buyerWallet: {
    type: String,
    default: ''
  },
  user: {
    type: Schema.ObjectId,
    ref: 'User'
  }
});

mongoose.model('Order', OrderSchema);
