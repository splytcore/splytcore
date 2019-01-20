'use strict';

/**
 * Module dependencies.
 */
var mongoose = require('mongoose'),
  Schema = mongoose.Schema;

/**
 * Cart Item Schema
 */
var CartItemSchema = new Schema({
  asset: {
    type: Schema.ObjectId,
    ref: 'Asset'
  },
  count: {
    type: Number,
    default: 1
  }  
})

mongoose.model('CartItem', CartItemSchema);
