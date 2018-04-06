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

//TODO: update score formula
ReviewSchema.post('init', (review) => {  
    
  // console.log('calculating score for...' + review.candidate)    
  review.score = (review.experience + review.communication + review.skills + review.cultureFit)/4    

})

ReviewSchema.statics.evaluate = function (review, next) {
  

  let score = review ? (review.experience + review.communication + review.skills + review.cultureFit)/4 : 0
  
  let val = ''
  if (score > 4) {
    val = 'YES'
  } else if (score > 3) {
    val = 'MAYBE'
  } else if (score > 2) {
    val = 'UNDECIDED'
  } else {
    val = 'NO'    
  } 

  next(val)
}

mongoose.model('Review', ReviewSchema)
