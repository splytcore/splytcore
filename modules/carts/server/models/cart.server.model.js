'use strict'

/**
 * Module dependencies.
 */
const mongoose = require('mongoose')
const Schema = mongoose.Schema

/**
 * Cart Schema
 */

var CartSchema = new Schema({
  created: {
    type: Date,
    default: Date.now
  },
  status: {
    type: String,
    enum: ['pending', 'ordered', 'canceled'],
    default: 'pending' 
  },     
  customer: {
    type: Schema.ObjectId,
    ref: 'User'
  }

});

mongoose.model('Cart', CartSchema)
