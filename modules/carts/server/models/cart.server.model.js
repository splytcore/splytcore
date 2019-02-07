'use strict'

/**
 * Module dependencies.
 */
const mongoose = require('mongoose')
const Schema = mongoose.Schema

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
  customer: {
    type: Schema.ObjectId,
    ref: 'User'
  }
})

mongoose.model('Cart', CartSchema)
