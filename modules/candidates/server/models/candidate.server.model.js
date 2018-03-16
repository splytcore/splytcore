'use strict';

/**
 * Module dependencies.
 */
const mongoose = require('mongoose'),
  Schema = mongoose.Schema

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
    enum: ['PENDING', 'YES', 'NO', 'MAYBE', 'UNDECIDED'],
    default: 'PENDING',
    required: 'Please fill in valuation',
    trim: true
  },        
  stage: {
    type: String,
    enum: ['REGISTERED', 'QUEUE', 'VALUATING', 'REVIEWED', 'OTHER', 'COMPLETED'],
    default: 'REGISTERED',
    required: 'Please fill in stage',
    trim: true
  }, 
  department: {
    type: String,
    enum: ['HR', 'DEV', 'ADMIN', 'EXEC', 'MGR', 'OTHER','ACCT', 'MKT', 'CUSTOMER_SUPPORT', 'SALES', 'IT_SUPPORT', 'LEGAL'],
    default: 'HR',
    required: 'Please choose department'    
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
  resumeURL: {
    type: String,
    default: 'modules/candidates/client/img/resumes/default.png'
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
