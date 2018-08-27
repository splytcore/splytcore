'use strict';

/**
 * Module dependencies.
 */
var mongoose = require('mongoose'),
  Schema = mongoose.Schema;

/**
 * Reward Schema
 */
var AssetSchema = new Schema({
  title: {
    type: String,
    default: '',
    required: 'Please fill title',
    trim: true
  },  
  description: {
    type: String,
    default: '',
    required: 'Please fill description',
    trim: true
  },  
  created: {
    type: Date,
    default: Date.now
  },
  //reward amount from contract
  ether: {
    type: Number
  },  
  address: {
    type: String
  },      
  //promisor
  user: {
    type: Schema.ObjectId,
    ref: 'User'
  }
});

mongoose.model('Asset', AssetSchema);
