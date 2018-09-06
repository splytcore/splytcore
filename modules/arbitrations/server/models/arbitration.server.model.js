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
  name: {
    type: String,
    default: '',
    required: 'Please fill Arbitration name',
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

mongoose.model('Arbitration', ArbitrationSchema);
