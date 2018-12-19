'use strict';

/**
 * Module dependencies.
 */
var should = require('should'),
  mongoose = require('mongoose'),
  User = mongoose.model('User'),
  Affiliate = mongoose.model('Affiliate');

/**
 * Globals
 */
var user,
  affiliate;

/**
 * Unit tests
 */
describe('Affiliate Model Unit Tests:', function() {
  beforeEach(function(done) {
    user = new User({
      firstName: 'Full',
      lastName: 'Name',
      displayName: 'Full Name',
      email: 'test@test.com',
      username: 'username',
      password: 'password'
    });

    user.save(function() {
      affiliate = new Affiliate({
        name: 'Affiliate Name',
        user: user
      });

      done();
    });
  });

  describe('Method Save', function() {
    it('should be able to save without problems', function(done) {
      this.timeout(0);
      return affiliate.save(function(err) {
        should.not.exist(err);
        done();
      });
    });

    it('should be able to show an error when try to save without name', function(done) {
      affiliate.name = '';

      return affiliate.save(function(err) {
        should.exist(err);
        done();
      });
    });
  });

  afterEach(function(done) {
    Affiliate.remove().exec(function() {
      User.remove().exec(function() {
        done();
      });
    });
  });
});
