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
  created: {
    type: Date,
    default: Date.now
  },
  user: {
    type: Schema.ObjectId,
    ref: 'User'
  }
});

mongoose.model('Store', StoreSchema);
