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
  department: {
    type: Schema.ObjectId,
    ref: 'Department'
  },  
  appointment: {
    type: Date,    
    required: true    
  }
})


mongoose.model('Appointment', AppointmentSchema)
