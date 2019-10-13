'use strict'

/**
 * Module dependencies.
 */
const passport = require('passport')
const LocalStrategy = require('passport-local').Strategy
const User = require('mongoose').model('User')

module.exports = function () {
  // Use local strategy
  passport.use(
    new LocalStrategy({
      usernameField: 'email',
      passwordField: 'password'
    },
    function (username, password, done) {
      User.findOne({ email: username.toLowerCase() }).populate('department').exec((err, user) => {
        if (err)
          return done(err);
        if (!user || !user.authenticate(password))
          return done(null, false, {
            message: 'Invalid username or password'
          })

        return done(null, user);
      })

    })
  )
};
