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
  seller: {
    type: String
  }, 
  marketPlaces: [{
    type: String
  }],  
  //contract address
  address: {
    type: String
  },       
  user: {
    type: Schema.ObjectId,
    ref: 'User'
  }
});

mongoose.model('Asset', AssetSchema);
