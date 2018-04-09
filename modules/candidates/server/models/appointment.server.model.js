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

 * Appointment Schema
 */
const AppointmentSchema = new Schema({
  candidate: {
    type: Schema.ObjectId,
    ref: 'Candidate'
  },
  time: {
    type: Date,    
    required: true    
  },  
  department: {
    type: String,
    enum: config.department,
    default: 'HR',    
    trim: true
  },    
  interviewer: {
    type: Schema.ObjectId,
    ref: 'User'
  },  
  created: {
    type: Date,
    default: Date.now
  }
})


mongoose.model('Appointment', AppointmentSchema)
