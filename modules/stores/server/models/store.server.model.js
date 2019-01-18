'use strict';

/**
 * Module dependencies.
 */
var mongoose = require('mongoose'),
  Schema = mongoose.Schema;

/**
 * Store Schema
 */
var StoreSchema = new Schema({
  name: {
    type: String,
    default: '',
    required: 'Please fill Store name',
    trim: true
  },
  description: {
    type: String,
    default: ''
  },  
  created: {
    type: Date,
    default: Date.now
  },
  categories: [{
    type: Schema.ObjectId,
    ref: 'Category'
  }],   
  affiliate: {
    type: Schema.ObjectId,
    ref: 'User'
  }
})


mongoose.model('Store', StoreSchema)



