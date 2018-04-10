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

 * Review Schema
 */
const ReviewSchema = new Schema({
  candidate: {
    type: Schema.ObjectId,
    ref: 'Candidate',
    required: true,
    unique: true
  },
  experience: {
    type: Number,
    default: 0,
    min: 0,
    max: 5,
    required: 'Please fill first experience'
  },
  communication: {
    type: Number,
    default: 0,
    min: 0,
    max: 5,    
    required: 'Please fill first communication'
  },
  cultureFit: {
    type: Number,
    default: 0,
    min: 0,
    max: 5,    
    required: 'Please fill culture'
  },
  skills: {
    type: Number,
    default: 0,
    min: 0,
    max: 5,    
    required: 'Please fill skills'
  },
  score: {
    type: Number
  },  
  education: {
    type: String,
    enum: ['NONE', 'HIGH_SCHOOL', 'SOME_COLLEGE', 'ASSOCIATE_DEGREE', 'BACHELORS_DEGREE', 'MASTERS_DEGREE'],
    default: 'NONE',
    required: 'Please select education'    
  },
  created: {
    type: Date,
    default: Date.now
  },
  reviewer: {
    type: Schema.ObjectId,
    ref: 'User'
  }

})

ReviewSchema.pre('save', function (next) {
  
  this.score = (this.experience + this.communication + this.skills + this.cultureFit)/4      
  
  let val = ''
  if (this.score > 4) {
    val = 'YES'
  } else if (this.score > 3) {
    val = 'MAYBE'
  } else if (this.score > 2) {
    val = 'UNDECIDED'
  } else {
    val = 'NO'    
  } 

  let Candidate = mongoose.model('Candidate')    
  Candidate.findOneAndUpdate({ _id: this.candidate._id }, { 'valuation' : val }, { upsert:true }).exec((err) => {
    next(err)
  })     
  
})

mongoose.model('Review', ReviewSchema)
