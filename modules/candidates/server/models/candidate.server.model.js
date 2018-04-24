'use strict';

/**
 * Module dependencies.
 */
const mongoose = require('mongoose')
const Schema = mongoose.Schema
const path = require('path')
const config = require(path.resolve('./config/config'))
const validator = require('validator')
const _ = require('lodash')


/**

 * Candidate Schema
 */
const CandidateSchema = new Schema({
  lastName: {
    type: String,
    default: '',
    required: 'Please fill last name',
    trim: true
  },
  firstName: {
    type: String,
    default: '',
    required: 'Please fill first name',
    trim: true
  },  
  email: {
    type: String,
    default: '',
    required: 'Please fill in email',
    trim: true,
    unique: true
  },    
  sms: {
    type: String,
    default: '',
    required: 'Please fill in phone number',
    trim: true
  },     
  valuation: {
    type: String,
    enum: config.valuation,
    default: 'PENDING',
    required: 'Please fill in valuation',
    trim: true
  },        
  otherValuation: {    
    type: String,
    uppercase: true
  },      
  stage: {
    type: String,
    enum: config.stage,
    default: 'REGISTERED',
    required: 'Please fill in stage',
    trim: true
  }, 
  position: {
    type: Schema.ObjectId,
    ref: 'Position',
    required: 'Please select position'
  },  
  checkin: {
    type: Date    
  },
  //transietn interview appointment. Do not update this field. Use Appointment Collection
  appointment: {
    type: Schema.ObjectId,
    ref: 'Appointment'
  },
  //Temporary images that gets uploaded to local server that gets merge to single pdf
  //These get deleted after that single pdf gets upload to S3 bucket
  resumeImageURLS: [{
    type: String    
  }],      
  //When candidates upload from web site
  //S3 url
  resumeDocURL: {
    type: String    
  },        
  registeredFrom: {
    type: String,
    enum: ['WEB', 'MOBILE'],    
    default: 'WEB'
  },          
  notes: [{
    created: {
      type: Date,
      default: Date.now,
    },
    note: {
      type: String,
      default: ''      
    },                
    user: {
      type: Schema.ObjectId,
      ref: 'User'
    }
  }],  
  created: {
    type: Date,
    default: Date.now
  },
  lockedBy: {
    type: Schema.ObjectId,
    ref: 'User'
  },
  //transient fields. Do not update directly. Used for querying and calucations
  score: {    
    type: Number
  },
  reviewer: {
    type: String      
  },
  department: {
    type: Schema.ObjectId,
    ref: 'Department'
  }  
  //End transient fields
})

CandidateSchema.pre('save', function (next) {

  if (this.isModified('lastName')) {   
    this.lastName = this.lastName.charAt(0).toUpperCase() + this.lastName.slice(1)  
  }
  if (this.isModified('firstName')) {     
    this.firstName = this.firstName.charAt(0).toUpperCase() + this.firstName.slice(1)
  }

  next()
})


CandidateSchema.pre('save', function (next) {

  //used for simplifed querying without using additional library just to query by department
  if (this.position && this.isModified('position')) {      
    let Position = mongoose.model('Position')                                                                
    Position.findById(this.position).populate('department').exec((err, position) => {      
      this.department = position.department
      next(err)
    })        
  } else {
    next()      
  }

})

//binds appointment time with appointment  object
CandidateSchema.post('init', (candidate, next) => {    
  console.log('feetchign appiontment for ' + candidate._id)
  let Appointment = mongoose.model('Appointment')
  Appointment.findOne({ candidate: candidate }).populate('appointment').exec((err, appt) => {    
    if (appt) {
      candidate.appointment = appt
    }    
    next(err)
  })  
})

mongoose.model('Candidate', CandidateSchema)
