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
  asset: {
    type: Schema.ObjectId,
    ref: 'Asset'
  },  
  user: {
    type: Schema.ObjectId,
    ref: 'User'
  }
});

mongoose.model('Arbitration', ArbitrationSchema);
