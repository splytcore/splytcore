'use strict'

/**
 * Module dependencies.
 */
const path = require('path')
const passport = require('passport')
const User = require('mongoose').model('User')
const config = require('../../../../config/config')

/**
 * Module init function.
 */
module.exports = function (app, db) {
  // Serialize sessions
  passport.serializeUser((user, done) => {
    done(null, user.id)
  })

  // Deserialize sessions
  passport.deserializeUser((id, done) => {
    User.findOne({ _id: id }, '-salt -password -walletPassword -privateKey').exec((err, user) => {      
      done(err, user);
    })
  })

  // Initialize strategies
  config.utils.getGlobbedPaths(path.join(__dirname, './strategies/**/*.js')).forEach(strategy => {
    require(path.resolve(strategy))(config)
  })

  // Add passport's middleware
  app.use(passport.initialize())
  app.use(passport.session())

}
