'use strict';

var should = require('should'),
  request = require('supertest'),
  path = require('path'),
  mongoose = require('mongoose'),
  User = mongoose.model('User'),
  Affiliate = mongoose.model('Affiliate'),
  express = require(path.resolve('./config/lib/express'));

/**
 * Globals
 */
var app,
  agent,
  credentials,
  user,
  affiliate;

/**
 * Affiliate routes tests
 */
describe('Affiliate CRUD tests', function () {

  before(function (done) {
    // Get application
    app = express.init(mongoose);
    agent = request.agent(app);

    done();
  });

  beforeEach(function (done) {
    // Create user credentials
    credentials = {
      username: 'username',
      password: 'M3@n.jsI$Aw3$0m3'
    };

    // Create a new user
    user = new User({
      firstName: 'Full',
      lastName: 'Name',
      displayName: 'Full Name',
      email: 'test@test.com',
      username: credentials.username,
      password: credentials.password,
      provider: 'local'
    });

    // Save a user to the test db and create new Affiliate
    user.save(function () {
      affiliate = {
        name: 'Affiliate name'
      };

      done();
    });
  });

  it('should be able to save a Affiliate if logged in', function (done) {
    agent.post('/api/auth/signin')
      .send(credentials)
      .expect(200)
      .end(function (signinErr, signinRes) {
        // Handle signin error
        if (signinErr) {
          return done(signinErr);
        }

        // Get the userId
        var userId = user.id;

        // Save a new Affiliate
        agent.post('/api/affiliates')
          .send(affiliate)
          .expect(200)
          .end(function (affiliateSaveErr, affiliateSaveRes) {
            // Handle Affiliate save error
            if (affiliateSaveErr) {
              return done(affiliateSaveErr);
            }

            // Get a list of Affiliates
            agent.get('/api/affiliates')
              .end(function (affiliatesGetErr, affiliatesGetRes) {
                // Handle Affiliates save error
                if (affiliatesGetErr) {
                  return done(affiliatesGetErr);
                }

                // Get Affiliates list
                var affiliates = affiliatesGetRes.body;

                // Set assertions
                (affiliates[0].user._id).should.equal(userId);
                (affiliates[0].name).should.match('Affiliate name');

                // Call the assertion callback
                done();
              });
          });
      });
  });

  it('should not be able to save an Affiliate if not logged in', function (done) {
    agent.post('/api/affiliates')
      .send(affiliate)
      .expect(403)
      .end(function (affiliateSaveErr, affiliateSaveRes) {
        // Call the assertion callback
        done(affiliateSaveErr);
      });
  });

  it('should not be able to save an Affiliate if no name is provided', function (done) {
    // Invalidate name field
    affiliate.name = '';

    agent.post('/api/auth/signin')
      .send(credentials)
      .expect(200)
      .end(function (signinErr, signinRes) {
        // Handle signin error
        if (signinErr) {
          return done(signinErr);
        }

        // Get the userId
        var userId = user.id;

        // Save a new Affiliate
        agent.post('/api/affiliates')
          .send(affiliate)
          .expect(400)
          .end(function (affiliateSaveErr, affiliateSaveRes) {
            // Set message assertion
            (affiliateSaveRes.body.message).should.match('Please fill Affiliate name');

            // Handle Affiliate save error
            done(affiliateSaveErr);
          });
      });
  });

  it('should be able to update an Affiliate if signed in', function (done) {
    agent.post('/api/auth/signin')
      .send(credentials)
      .expect(200)
      .end(function (signinErr, signinRes) {
        // Handle signin error
        if (signinErr) {
          return done(signinErr);
        }

        // Get the userId
        var userId = user.id;

        // Save a new Affiliate
        agent.post('/api/affiliates')
          .send(affiliate)
          .expect(200)
          .end(function (affiliateSaveErr, affiliateSaveRes) {
            // Handle Affiliate save error
            if (affiliateSaveErr) {
              return done(affiliateSaveErr);
            }

            // Update Affiliate name
            affiliate.name = 'WHY YOU GOTTA BE SO MEAN?';

            // Update an existing Affiliate
            agent.put('/api/affiliates/' + affiliateSaveRes.body._id)
              .send(affiliate)
              .expect(200)
              .end(function (affiliateUpdateErr, affiliateUpdateRes) {
                // Handle Affiliate update error
                if (affiliateUpdateErr) {
                  return done(affiliateUpdateErr);
                }

                // Set assertions
                (affiliateUpdateRes.body._id).should.equal(affiliateSaveRes.body._id);
                (affiliateUpdateRes.body.name).should.match('WHY YOU GOTTA BE SO MEAN?');

                // Call the assertion callback
                done();
              });
          });
      });
  });

  it('should be able to get a list of Affiliates if not signed in', function (done) {
    // Create new Affiliate model instance
    var affiliateObj = new Affiliate(affiliate);

    // Save the affiliate
    affiliateObj.save(function () {
      // Request Affiliates
      request(app).get('/api/affiliates')
        .end(function (req, res) {
          // Set assertion
          res.body.should.be.instanceof(Array).and.have.lengthOf(1);

          // Call the assertion callback
          done();
        });

    });
  });

  it('should be able to get a single Affiliate if not signed in', function (done) {
    // Create new Affiliate model instance
    var affiliateObj = new Affiliate(affiliate);

    // Save the Affiliate
    affiliateObj.save(function () {
      request(app).get('/api/affiliates/' + affiliateObj._id)
        .end(function (req, res) {
          // Set assertion
          res.body.should.be.instanceof(Object).and.have.property('name', affiliate.name);

          // Call the assertion callback
          done();
        });
    });
  });

  it('should return proper error for single Affiliate with an invalid Id, if not signed in', function (done) {
    // test is not a valid mongoose Id
    request(app).get('/api/affiliates/test')
      .end(function (req, res) {
        // Set assertion
        res.body.should.be.instanceof(Object).and.have.property('message', 'Affiliate is invalid');

        // Call the assertion callback
        done();
      });
  });

  it('should return proper error for single Affiliate which doesnt exist, if not signed in', function (done) {
    // This is a valid mongoose Id but a non-existent Affiliate
    request(app).get('/api/affiliates/559e9cd815f80b4c256a8f41')
      .end(function (req, res) {
        // Set assertion
        res.body.should.be.instanceof(Object).and.have.property('message', 'No Affiliate with that identifier has been found');

        // Call the assertion callback
        done();
      });
  });

  it('should be able to delete an Affiliate if signed in', function (done) {
    agent.post('/api/auth/signin')
      .send(credentials)
      .expect(200)
      .end(function (signinErr, signinRes) {
        // Handle signin error
        if (signinErr) {
          return done(signinErr);
        }

        // Get the userId
        var userId = user.id;

        // Save a new Affiliate
        agent.post('/api/affiliates')
          .send(affiliate)
          .expect(200)
          .end(function (affiliateSaveErr, affiliateSaveRes) {
            // Handle Affiliate save error
            if (affiliateSaveErr) {
              return done(affiliateSaveErr);
            }

            // Delete an existing Affiliate
            agent.delete('/api/affiliates/' + affiliateSaveRes.body._id)
              .send(affiliate)
              .expect(200)
              .end(function (affiliateDeleteErr, affiliateDeleteRes) {
                // Handle affiliate error error
                if (affiliateDeleteErr) {
                  return done(affiliateDeleteErr);
                }

                // Set assertions
                (affiliateDeleteRes.body._id).should.equal(affiliateSaveRes.body._id);

                // Call the assertion callback
                done();
              });
          });
      });
  });

  it('should not be able to delete an Affiliate if not signed in', function (done) {
    // Set Affiliate user
    affiliate.user = user;

    // Create new Affiliate model instance
    var affiliateObj = new Affiliate(affiliate);

    // Save the Affiliate
    affiliateObj.save(function () {
      // Try deleting Affiliate
      request(app).delete('/api/affiliates/' + affiliateObj._id)
        .expect(403)
        .end(function (affiliateDeleteErr, affiliateDeleteRes) {
          // Set message assertion
          (affiliateDeleteRes.body.message).should.match('User is not authorized');

          // Handle Affiliate error error
          done(affiliateDeleteErr);
        });

    });
  });

  it('should be able to get a single Affiliate that has an orphaned user reference', function (done) {
    // Create orphan user creds
    var _creds = {
      username: 'orphan',
      password: 'M3@n.jsI$Aw3$0m3'
    };

    // Create orphan user
    var _orphan = new User({
      firstName: 'Full',
      lastName: 'Name',
      displayName: 'Full Name',
      email: 'orphan@test.com',
      username: _creds.username,
      password: _creds.password,
      provider: 'local'
    });

    _orphan.save(function (err, orphan) {
      // Handle save error
      if (err) {
        return done(err);
      }

      agent.post('/api/auth/signin')
        .send(_creds)
        .expect(200)
        .end(function (signinErr, signinRes) {
          // Handle signin error
          if (signinErr) {
            return done(signinErr);
          }

          // Get the userId
          var orphanId = orphan._id;

          // Save a new Affiliate
          agent.post('/api/affiliates')
            .send(affiliate)
            .expect(200)
            .end(function (affiliateSaveErr, affiliateSaveRes) {
              // Handle Affiliate save error
              if (affiliateSaveErr) {
                return done(affiliateSaveErr);
              }

              // Set assertions on new Affiliate
              (affiliateSaveRes.body.name).should.equal(affiliate.name);
              should.exist(affiliateSaveRes.body.user);
              should.equal(affiliateSaveRes.body.user._id, orphanId);

              // force the Affiliate to have an orphaned user reference
              orphan.remove(function () {
                // now signin with valid user
                agent.post('/api/auth/signin')
                  .send(credentials)
                  .expect(200)
                  .end(function (err, res) {
                    // Handle signin error
                    if (err) {
                      return done(err);
                    }

                    // Get the Affiliate
                    agent.get('/api/affiliates/' + affiliateSaveRes.body._id)
                      .expect(200)
                      .end(function (affiliateInfoErr, affiliateInfoRes) {
                        // Handle Affiliate error
                        if (affiliateInfoErr) {
                          return done(affiliateInfoErr);
                        }

                        // Set assertions
                        (affiliateInfoRes.body._id).should.equal(affiliateSaveRes.body._id);
                        (affiliateInfoRes.body.name).should.equal(affiliate.name);
                        should.equal(affiliateInfoRes.body.user, undefined);

                        // Call the assertion callback
                        done();
                      });
                  });
              });
            });
        });
    });
  });

  afterEach(function (done) {
    User.remove().exec(function () {
      Affiliate.remove().exec(done);
    });
  });
});
