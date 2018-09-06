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
  name: {
    type: String,
    default: '',
    required: 'Please fill Reputation name',
    trim: true
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

mongoose.model('Reputation', ReputationSchema);
