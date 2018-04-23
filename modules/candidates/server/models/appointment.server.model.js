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
    ref: 'Candidate',
    unique: true
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


// AppointmentSchema.pre('save', function (next) {

//   let Candidate = mongoose.model('Candidate')                                                                
//   console.log('update candidate appointment')
//   console.log(this.appointment)
//   if (this.appointment)   {
//     Candidate.findOneAndUpdate({ candidate: this.candidate }, { appointment: this.appointment }).exec((err, candidate) => {          
//       next(err)
//     })        
//   } else {
//     next()
//   }

// })

mongoose.model('Appointment', AppointmentSchema)
