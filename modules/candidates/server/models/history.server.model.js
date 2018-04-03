'use strict';

/**
 * Module dependencies.
 */
const mongoose = require('mongoose')
const Schema = mongoose.Schema
const path = require('path')
const config = require(path.resolve('./config/config'))
const validator = require('validator')

/**

 * Candidate Schema
 */
const HistorySchema = new Schema({
  candidate: {
    type: Schema.ObjectId,
    ref: 'Candidate'
  },
  action: {
    enum: config.actions,
    type: String,
    required: true,
    default: ''    
  },  
  created: {
    type: Date,
    default: Date.now
  },
  from: {
    type: String
  },
  to: {
    type: String
  },
  user: {
    type: Schema.ObjectId,
    ref: 'User'
  }  
})

mongoose.model('History', HistorySchema)
