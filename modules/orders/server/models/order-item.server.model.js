'use strict';

/**
 * Module dependencies.
 */
const mongoose = require('mongoose')
const Schema = mongoose.Schema

/**
 * Order Product Schema
 */
const OrderItemSchema = new Schema({
  order: {
    type: Schema.ObjectId,
    ref: 'Order'
  },
  created: {
    type: Date,
    default: Date.now
  },
  store: {
    type: Schema.ObjectId,
    ref: 'Store'
  },
  seller: {
    type: Schema.ObjectId,
    ref: 'User'
  },  
  asset: {
    type: Schema.ObjectId,
    ref: 'Asset'
  },
  hashtag: {
    type: Schema.ObjectId,
    ref: 'Hashtag'
  },  
  quantity: {
    type: Number,
    default: 1
  },
  soldPrice: {
    type: Number,
    default: 0
  },  
  reward: {
    type: Number,
    default: 0
  }  
})

mongoose.model('OrderItem', OrderItemSchema)
