'use strict'

/**
 * Module dependencies.
 */
const mongoose = require('mongoose')
const Schema = mongoose.Schema
const deepPopulate = require('mongoose-deep-populate')(mongoose)

/**
 * Cart Schema
 */

let CartSchema = new Schema({
  created: {
    type: Date,
    default: Date.now
  },
  status: {
    type: String,
    enum: ['pending', 'ordered', 'canceled'],
    default: 'pending' 
  },     
  tax: {
    type: Number,
    default: 0
  },     
  totalCost: {
    type: Number,
    default: 0
  }, 
  totalQuantity: {
    type: Number,
    default: 0
  },     
  overviewImageUrl: {
    type: String,
    default: ''
  },  
  // store: {
  //   type: Schema.ObjectId,
  //   ref: 'Store'
  // },
  customer: {
    type: Schema.ObjectId,
    ref: 'User'
  }
})

CartSchema.plugin(deepPopulate)
mongoose.model('Cart', CartSchema)
