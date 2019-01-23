'use strict';

/**
 * Module dependencies.
 */
var mongoose = require('mongoose'),
  Schema = mongoose.Schema;

/**
 * Stripe Schema
 */
var StripeSchema = new Schema({
  name: {
    type: String,
    default: '',
    required: 'Please fill Stripe name',
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

mongoose.model('Stripe', StripeSchema);
