'use strict';

/**
 * Module dependencies.
 */
const mongoose = require('mongoose')
const Schema = mongoose.Schema
const deepPopulate = require('mongoose-deep-populate')(mongoose);
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

CartItemSchema.plugin(deepPopulate)

mongoose.model('CartItem', CartItemSchema)
