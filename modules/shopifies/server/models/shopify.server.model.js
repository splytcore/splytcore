'use strict';

/**
 * Module dependencies.
 */
var mongoose = require('mongoose'),
  Schema = mongoose.Schema;

/**
 * Shopify Schema
 */
var ShopifySchema = new Schema({
  name: {
    type: String,
    default: '',
    required: 'Please fill Shopify name',
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

mongoose.model('Shopify', ShopifySchema);
