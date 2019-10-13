'use strict'

/**
 * Module dependencies.
 */
const mongoose = require('mongoose')
const crypto = require('crypto')
const validator = require('validator')
const generatePassword = require('generate-password')
const owasp = require('owasp-password-strength-test')
const path = require('path')
const config = require(path.resolve('./config/config'))
const cryptojs = require('crypto-js')


/**
 * A Validation function for local strategy properties
 */
const validateLocalStrategyProperty = property => {
  return ((this.provider !== 'local' && !this.updated) || property.length);
}

/**
 * A Validation function for local strategy email
 */
const validateLocalStrategyEmail = (email) => {
  return ((this.provider !== 'local' && !this.updated) || validator.isEmail(email));
}

/**
 * User Schema
 */
const UserSchema = new mongoose.Schema({
  firstName: {
    type: String,
    trim: true,
    default: '',
    validate: [validateLocalStrategyProperty, 'Please fill in your first name']
  },
  lastName: {
    type: String,
    trim: true,
    default: '',
    validate: [validateLocalStrategyProperty, 'Please fill in your last name']
  },
  displayName: {
    type: String,
    trim: true
  },
  privateKey: {
    type: String,
    trim: true
  },
  walletPassword: {
    type: String,
    trim: true
  },  
  publicKey: {
    type: String,
    trim: true
  },  
  tokenBalance: {
    type: String,
    trim: true
  }, 
  etherBalance: {
    type: String,
    trim: true
  },   
  type: {
    type: String,
    default: 'SELLER',
    enum: ['SELLER', 'BUYER', 'MARKET_PLACE', 'ARBITRAITOR']
  },
  email: {
    type: String,
    unique: true,
    lowercase: true,
    trim: true,
    default: '',
    validate: [validateLocalStrategyEmail, 'Please fill a valid email address']
  },
  provider: {
    type: String,
    required: 'Provider is required',
    default: 'local'
  },  
  password: {
    type: String,
    default: ''
  },
  salt: {
    type: String
  },
  profileImageURL: {
    type: String,
    default: 'modules/users/client/img/profile/default.png'
  },
  roles: {
    type: [{
      type: String,
      enum: ['user', 'admin', 'seller', 'buyer', 'marketPlace', 'arbitrator', 'affiliate']
    }],
    default: ['seller'],
    required: 'Please provide at least one role'
  },
  updated: {
    type: Date
  },
  created: {
    type: Date,
    default: Date.now
  },
  /* For reset password */
  resetPasswordToken: {
    type: String
  },
  resetPasswordExpires: {
    type: Date
  }
})

/**
 * Hook a pre save method to hash the password
 */
UserSchema.pre('save', next => {

  if (this.password && this.isModified('password')) {
    this.salt = crypto.randomBytes(16).toString('base64')   
    this.password = this.hashPassword(this.password)
  }

  if (this.walletPassword && this.isModified('walletPassword'))
    this.walletPassword = cryptojs.AES.encrypt(this.walletPassword, process.env.sessionSecret);    

  next()

})

/**
 * Hook a pre validate method to test the local password
 */
UserSchema.pre('validate', next => {
  if (this.provider === 'local' && this.password && this.isModified('password')) {
    console.log('enable in production')
    var result = owasp.test(this.password)
    if (result.errors.length) {
      // var error = result.errors.join(' ')
      // this.invalidate('password', error)
    }
  }

  next()

})

/**
 * Create instance method for hashing a password
 */
UserSchema.methods.hashPassword = password => {  
  if (this.salt && password)   
    return crypto.pbkdf2Sync(password, new Buffer(this.salt, 'base64'), 10000, 64, 'sha1').toString('base64')
  else
    return password
}

/**
 * Create instance method for authenticating user
 */
UserSchema.methods.authenticate = password => {
  return this.password === this.hashPassword(password);
};

/**
* Generates a random passphrase that passes the owasp test.
* Returns a promise that resolves with the generated passphrase, or rejects with an error if something goes wrong.
* NOTE: Passphrases are only tested against the required owasp strength tests, and not the optional tests.
*/
UserSchema.statics.generateRandomPassphrase = function () {
  return new Promise((resolve, reject) => {
    var password = ''
    var repeatingCharacters = new RegExp('(.)\\1{2,}', 'g')

    // iterate until the we have a valid passphrase. 
    // NOTE: Should rarely iterate more than once, but we need this to ensure no repeating characters are present.
    while (password.length < 20 || repeatingCharacters.test(password)) {
      // build the random password
      password = generatePassword.generate({
        length: Math.floor(Math.random() * (20)) + 20, // randomize length between 20 and 40 characters
        numbers: true,
        symbols: false,
        uppercase: true,
        excludeSimilarCharacters: true,
      })

      // check if we need to remove any repeating characters.
      password = password.replace(repeatingCharacters, '')
    }

    // Send the rejection back if the passphrase fails to pass the strength test
    if (owasp.test(password).errors.length)
      reject(new Error('An unexpected problem occured while generating the random passphrase'))
    else
      // resolve with the validated passphrase
      resolve(password)
  })

}

mongoose.model('User', UserSchema);
