'use strict';

/**
 * Module dependencies.
 */
const mongoose = require('mongoose')
const validator = require('validator')
const Schema = mongoose.Schema

/**
 * A Validation function for local strategy email
 */
const validateLocalStrategyEmail = function (email) {

  return validator.isEmail(email)

}

/**
 * Preregistration Schema
 */
let PreregistrationSchema = new Schema({
  name: {
    type: String,
    default: '',
    required: 'Please fill name',
    trim: true
  },
  email: {
    type: String,
    unique: true,
    lowercase: true,
    trim: true,
    default: '',
    validate: [validateLocalStrategyEmail, 'Please fill a valid email address']
  },
  inviteSentDate: {
    type: Date
  },
  created: {
    type: Date,
    default: Date.now
  },
  user: {
    type: Schema.ObjectId,
    ref: 'User'
  }
});

mongoose.model('Preregistration', PreregistrationSchema);
