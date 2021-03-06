'use strict';

/**
 * Module dependencies.
 */
var mongoose = require('mongoose'),
  Schema = mongoose.Schema;

/**
 * Arbitration Schema
 */
var ArbitrationSchema = new Schema({
  created: {
    type: Date,
    default: Date.now
  },
  contractAddress: {
    type: String,
    default: ''
  },      
  reporterWallet: {
    type: String,
    default: ''
  },    
  reason: {
    type: Number,
    default: 0
  },        
  assetAddress: {
    type: String,
    default: ''
  },
  transactionHash: {
    type: String,
    default: ''
  },      
  user: {
    type: Schema.ObjectId,
    ref: 'User'
  }
});

mongoose.model('Arbitration', ArbitrationSchema);
