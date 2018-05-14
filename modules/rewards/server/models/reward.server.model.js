'use strict';

/**
 * Module dependencies.
 */
var mongoose = require('mongoose'),
  Schema = mongoose.Schema;

/**
 * Reward Schema
 */
var RewardSchema = new Schema({
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
  category: {
    type: Schema.ObjectId,
    ref: 'Category',
    required: 'Please fill Category'    
  },    
  created: {
    type: Date,
    default: Date.now
  },
  //Reward amount. Transient field to get from contract
  promisee: {
    type: Schema.ObjectId,
    ref: 'User'
  },
  //reward amount from contract
  ether: {
    type: Number
  },  
  stage: {
    type: String
  },    
  //Reward contract address
  address: {
    type: String
  },      
  //promisor
  user: {
    type: Schema.ObjectId,
    ref: 'User'
  }
});

mongoose.model('Reward', RewardSchema);
