'use strict';

/**
 * Module dependencies.
 */
var mongoose = require('mongoose'),
  Schema = mongoose.Schema;

/**
 * Market Schema
 */
var MarketSchema = new Schema({
  name: {
    type: String,
    default: '',
    required: 'Please fill Market name',
    trim: true
  },
  wallet: {
    type: String,
    default: '',
    required: 'Please fill Wallet',
    trim: true
  },  
  tokenBalance: {
    type: Number
  },    
  created: {
    type: Date,
    default: Date.now
  },
  user: {
    type: Schema.ObjectId,
    ref: 'User'
  }
});

mongoose.model('Market', MarketSchema);
