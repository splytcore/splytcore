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

 * Position Schema
 */
const PositionSchema = new Schema({  
  name: {
    type: String,    
    uppercase: true,
    required: 'Please select name'    
  },
  department: {
    type: Schema.ObjectId,
    ref: 'Department',    
    required: 'Please select department'    
  },  
  created: {
    type: Date,
    default: Date.now
  }
})


mongoose.model('Position', PositionSchema)
