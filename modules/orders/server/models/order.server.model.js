'use strict';

/**
 * Module dependencies.
 */
const mongoose = require('mongoose');
const Schema = mongoose.Schema;

/**
 * Order Schema
 */
const OrderSchema = new Schema({
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
  trxAmount: {
    type: Number,
    default: 0
  },  
  //buyer wallet
  buyerWallet: {
    type: String,
    default: ''
  },
  //market place wallet
  marketPlace: {
    type: String,
    default: ''
  },  
  transactionHash: {
    type: String,
    default: ''
  },  
  contributions: [{
    contributor: {
      type: String
    },
    //contract returns date in seconds
    date: {
      type: Number
    },
    amount: {
      type: Number
    }    
  }], 
  user: {
    type: Schema.ObjectId,
    ref: 'User'
  }
})

mongoose.model('Order', OrderSchema)
