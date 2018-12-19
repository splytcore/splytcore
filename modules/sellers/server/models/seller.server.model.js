'use strict';

/**
 * Module dependencies.
 */
var mongoose = require('mongoose'),
  Schema = mongoose.Schema;

/**
 * Seller Schema
 */
var SellerSchema = new Schema({
  name: {
    type: String,
    default: '',
    required: 'Please fill Seller name',
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

mongoose.model('Seller', SellerSchema);
