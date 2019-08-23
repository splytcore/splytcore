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
  shopName: {
    type: String,
    default: ''
  },
  accessToken: {
    type: String,
    default: ''
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
