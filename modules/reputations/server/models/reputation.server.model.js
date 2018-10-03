'use strict';

/**
 * Module dependencies.
 */
var mongoose = require('mongoose'),
  Schema = mongoose.Schema;

/**
 * Reputation Schema
 */
var ReputationSchema = new Schema({
  wallet: {
    type: String,
    default: '',
    required: 'Please fill wallet address',
    trim: true
  },
  rating: {
    type: Number,
    default: 5,
  },
  transactionHashes: [{
    type: String,
    default: ''
  }],  
  fromWallet: {
    type: String,
    default: ''
  },
  rates: [{
    rate: {
      type: String,
      default: ''
    },
    from: {
      type: String,
      default: ''
    },
    date: {
      type: String,
      default: ''
    },
    transactionHash: {
      type: String,
      default: ''
    }    
  }],    
  date: {
    type: Date,
    default: Date.now
  }

})

mongoose.model('Reputation', ReputationSchema)
