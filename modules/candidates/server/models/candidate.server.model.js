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
  otherStage: {    
    type: String,
    uppercase: true
  },      
  department: {
    type: String,
    enum: config.department,
    default: 'HR',
    required: 'Please choose department'    
  },
  otherDepartment: {
    type: String,
    uppercase: true         
  },  
  position: {
    enum: config.position,
    type: String,
    default: ''    
  },  
  otherPosition: {    
    type: String,
    uppercase: true
  },    
  rating: {
    type: Number,
    default: 0
  },  
  checkin: {
    type: Date    
  },
  appointment: {
    type: Date
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
  }

})

mongoose.model('Candidate', CandidateSchema)
