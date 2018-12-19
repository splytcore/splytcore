'use strict';

/**
 * Module dependencies.
 */
var mongoose = require('mongoose'),
  Schema = mongoose.Schema;

/**
 * Affiliate Schema
 */
var AffiliateSchema = new Schema({
  name: {
    type: String,
    default: '',
    required: 'Please fill Affiliate name',
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

mongoose.model('Affiliate', AffiliateSchema);
