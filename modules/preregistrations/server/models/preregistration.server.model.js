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
  // name: {
  //   type: String,
  //   default: '',
  //   required: 'Please fill name',
  //   trim: true
  // },
  // email: {
  //   type: String,
  //   unique: true,
  //   lowercase: true,
  //   trim: true,
  //   default: '',
  //   validate: [validateLocalStrategyEmail, 'Please fill a valid email address']
  // },
  signupToken: {
    type: String,
    unique: true
  },
  inviteSentDate: {
    type: Date
  },  
  signupDate: {
    type: Date
  },
  created: {
    type: Date,
    default: Date.now
  },
  user: {
    type: Schema.ObjectId,
    ref: 'User'
  },
  signupUser: {
    type: Schema.ObjectId,
    ref: 'User'
  }
})

/**
 * Hook a pre save method to hash the password
 */
// PreregistrationSchema.pre('save', function (next) {
//   if (this.password && this.isModified('password')) {
//     this.salt = crypto.randomBytes(16).toString('base64');    
//     this.password = this.hashPassword(this.password);
//   }

//   next();
// });

mongoose.model('Preregistration', PreregistrationSchema);
