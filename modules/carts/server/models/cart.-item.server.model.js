'use strict';

/**
 * Module dependencies.
 */
const mongoose = require('mongoose')
const Schema = mongoose.Schema

/**
 * Cart Item Schema
 */
let CartItemSchema = new Schema({
  cart: {
    type: Schema.ObjectId,
    ref: 'Cart'
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
  }  
})

CartItemSchema.index({ cart: 1, asset: 1 }, { unique: true })
mongoose.model('CartItem', CartItemSchema)
