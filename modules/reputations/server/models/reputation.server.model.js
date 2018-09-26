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
  transactionHash: {
    type: String,
    default: ''
  },  
  fromWallet: {
    type: String,
    default: ''
  },
  date: {
    type: Date,
    default: Date.now
  }

})

mongoose.model('Reputation', ReputationSchema)
