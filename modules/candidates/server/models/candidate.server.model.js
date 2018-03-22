'use strict';

/**
 * Module dependencies.
 */
const mongoose = require('mongoose')
const Schema = mongoose.Schema
const path = require('path')
const config = require(path.resolve('./config/config'))
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
  stage: {
    type: String,
    enum: config.stage,
    default: 'REGISTERED',
    required: 'Please fill in stage',
    trim: true
  }, 
  department: {
    type: String,
    enum: config.department,
    default: 'HR',
    required: 'Please choose department'    
  },
  otherDepartment: {
    type: String          
  },  
  position: {
    enum: config.position,
    type: String,
    default: ''    
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
  //When candidates upload from tablet 
  resumeImageURL: {
    type: String,
    default: 'modules/candidates/client/img/resumes/default.png'
  },      
  //When candidates upload from web site
  resumeDocURL: {
    type: String,
    default: 'modules/candidates/client/img/resumes/default.pdf'
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
  }
});

mongoose.model('Candidate', CandidateSchema);
