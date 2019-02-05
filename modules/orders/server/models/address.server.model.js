'use strict';

/**
 * Module dependencies.
 */
const mongoose = require('mongoose')
const Schema = mongoose.Schema

/**
 * Order Schema
 */
let AddressSchema = new Schema({
  created: {
    type: Date,
    default: Date.now
  },
  type: {
    type: String,
    enum: ['billing', 'shipping'],
    default: 'billing' 
  },    
  address1: {
    type: String,
    required: 'Address 1 is required'
  },    
  address2: {
    type: String
  },   
  city: {
    type: String,
    required: 'City is required'
  },   
  state: {
    type: String,
    required: 'State is required'
  },   
  zip: {
    type: String,
    required: 'Zip is required'
  }, 
  user: {
    type: Schema.ObjectId,
    ref: 'User'
  }
})

mongoose.model('Address', AddressSchema);
