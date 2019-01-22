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
  cart: {
    type: Schema.ObjectId,
    ref: 'Cart'
  },  
  asset: {
    type: Schema.ObjectId,
    ref: 'Asset'
  },
  quantity: {
    type: Number,
    default: 1
  }  
})

mongoose.model('CartItem', CartItemSchema);
