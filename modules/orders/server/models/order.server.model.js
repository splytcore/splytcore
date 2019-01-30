'use strict';

/**
 * Module dependencies.
 */
var mongoose = require('mongoose'),
  Schema = mongoose.Schema;

/**
 * Order Schema
 */
var OrderSchema = new Schema({
  created: {
    type: Date,
    default: Date.now
  },
  status: {
    type: String,
    enum: ['pending', 'paid', 'refunded'],
    default: 'pending' 
  },    
  totalQuantity: {
    type: Number,
    default: 0
  },
  totalCost: {
    type: Number,
    default: 0
  },   
  //customer
  customer: {
    type: Schema.ObjectId,
    ref: 'User'
  },
  cart: {
    type: Schema.ObjectId,
    ref: 'Cart'
  },  
  items: {
    type: Schema.ObjectId,
    ref: 'OrderItem'
  },
  stripeToken: {
    type: String,
    default: ''
  }

})

mongoose.model('Order', OrderSchema);
