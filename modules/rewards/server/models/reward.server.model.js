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
  name: {
    type: String,
    default: '',
    required: 'Please fill Reward name',
    trim: true
  },
  created: {
    type: Date,
    default: Date.now
  },
  //Reward amount. Transient field to get from contract
  finder: {
    type: Schema.ObjectId,
    ref: 'User'
  },
  ether: {
    type: Number
  },  
  stage: {
    type: String
  },    
  user: {
    type: Schema.ObjectId,
    ref: 'User'
  }
});

mongoose.model('Reward', RewardSchema);
