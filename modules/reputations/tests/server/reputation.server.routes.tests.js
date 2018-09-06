'use strict';

var should = require('should'),
  request = require('supertest'),
  path = require('path'),
  mongoose = require('mongoose'),
  User = mongoose.model('User'),
  Reputation = mongoose.model('Reputation'),
  express = require(path.resolve('./config/lib/express'));

/**
 * Globals
 */
var app,
  agent,
  credentials,
  user,
  reputation;

/**
 * Reputation routes tests
 */
describe('Reputation CRUD tests', function () {

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

    // Save a user to the test db and create new Reputation
    user.save(function () {
      reputation = {
        name: 'Reputation name'
      };

      done();
    });
  });

  it('should be able to save a Reputation if logged in', function (done) {
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

        // Save a new Reputation
        agent.post('/api/reputations')
          .send(reputation)
          .expect(200)
          .end(function (reputationSaveErr, reputationSaveRes) {
            // Handle Reputation save error
            if (reputationSaveErr) {
              return done(reputationSaveErr);
            }

            // Get a list of Reputations
            agent.get('/api/reputations')
              .end(function (reputationsGetErr, reputationsGetRes) {
                // Handle Reputations save error
                if (reputationsGetErr) {
                  return done(reputationsGetErr);
                }

                // Get Reputations list
                var reputations = reputationsGetRes.body;

                // Set assertions
                (reputations[0].user._id).should.equal(userId);
                (reputations[0].name).should.match('Reputation name');

                // Call the assertion callback
                done();
              });
          });
      });
  });

  it('should not be able to save an Reputation if not logged in', function (done) {
    agent.post('/api/reputations')
      .send(reputation)
      .expect(403)
      .end(function (reputationSaveErr, reputationSaveRes) {
        // Call the assertion callback
        done(reputationSaveErr);
      });
  });

  it('should not be able to save an Reputation if no name is provided', function (done) {
    // Invalidate name field
    reputation.name = '';

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

        // Save a new Reputation
        agent.post('/api/reputations')
          .send(reputation)
          .expect(400)
          .end(function (reputationSaveErr, reputationSaveRes) {
            // Set message assertion
            (reputationSaveRes.body.message).should.match('Please fill Reputation name');

            // Handle Reputation save error
            done(reputationSaveErr);
          });
      });
  });

  it('should be able to update an Reputation if signed in', function (done) {
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

        // Save a new Reputation
        agent.post('/api/reputations')
          .send(reputation)
          .expect(200)
          .end(function (reputationSaveErr, reputationSaveRes) {
            // Handle Reputation save error
            if (reputationSaveErr) {
              return done(reputationSaveErr);
            }

            // Update Reputation name
            reputation.name = 'WHY YOU GOTTA BE SO MEAN?';

            // Update an existing Reputation
            agent.put('/api/reputations/' + reputationSaveRes.body._id)
              .send(reputation)
              .expect(200)
              .end(function (reputationUpdateErr, reputationUpdateRes) {
                // Handle Reputation update error
                if (reputationUpdateErr) {
                  return done(reputationUpdateErr);
                }

                // Set assertions
                (reputationUpdateRes.body._id).should.equal(reputationSaveRes.body._id);
                (reputationUpdateRes.body.name).should.match('WHY YOU GOTTA BE SO MEAN?');

                // Call the assertion callback
                done();
              });
          });
      });
  });

  it('should be able to get a list of Reputations if not signed in', function (done) {
    // Create new Reputation model instance
    var reputationObj = new Reputation(reputation);

    // Save the reputation
    reputationObj.save(function () {
      // Request Reputations
      request(app).get('/api/reputations')
        .end(function (req, res) {
          // Set assertion
          res.body.should.be.instanceof(Array).and.have.lengthOf(1);

          // Call the assertion callback
          done();
        });

    });
  });

  it('should be able to get a single Reputation if not signed in', function (done) {
    // Create new Reputation model instance
    var reputationObj = new Reputation(reputation);

    // Save the Reputation
    reputationObj.save(function () {
      request(app).get('/api/reputations/' + reputationObj._id)
        .end(function (req, res) {
          // Set assertion
          res.body.should.be.instanceof(Object).and.have.property('name', reputation.name);

          // Call the assertion callback
          done();
        });
    });
  });

  it('should return proper error for single Reputation with an invalid Id, if not signed in', function (done) {
    // test is not a valid mongoose Id
    request(app).get('/api/reputations/test')
      .end(function (req, res) {
        // Set assertion
        res.body.should.be.instanceof(Object).and.have.property('message', 'Reputation is invalid');

        // Call the assertion callback
        done();
      });
  });

  it('should return proper error for single Reputation which doesnt exist, if not signed in', function (done) {
    // This is a valid mongoose Id but a non-existent Reputation
    request(app).get('/api/reputations/559e9cd815f80b4c256a8f41')
      .end(function (req, res) {
        // Set assertion
        res.body.should.be.instanceof(Object).and.have.property('message', 'No Reputation with that identifier has been found');

        // Call the assertion callback
        done();
      });
  });

  it('should be able to delete an Reputation if signed in', function (done) {
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

        // Save a new Reputation
        agent.post('/api/reputations')
          .send(reputation)
          .expect(200)
          .end(function (reputationSaveErr, reputationSaveRes) {
            // Handle Reputation save error
            if (reputationSaveErr) {
              return done(reputationSaveErr);
            }

            // Delete an existing Reputation
            agent.delete('/api/reputations/' + reputationSaveRes.body._id)
              .send(reputation)
              .expect(200)
              .end(function (reputationDeleteErr, reputationDeleteRes) {
                // Handle reputation error error
                if (reputationDeleteErr) {
                  return done(reputationDeleteErr);
                }

                // Set assertions
                (reputationDeleteRes.body._id).should.equal(reputationSaveRes.body._id);

                // Call the assertion callback
                done();
              });
          });
      });
  });

  it('should not be able to delete an Reputation if not signed in', function (done) {
    // Set Reputation user
    reputation.user = user;

    // Create new Reputation model instance
    var reputationObj = new Reputation(reputation);

    // Save the Reputation
    reputationObj.save(function () {
      // Try deleting Reputation
      request(app).delete('/api/reputations/' + reputationObj._id)
        .expect(403)
        .end(function (reputationDeleteErr, reputationDeleteRes) {
          // Set message assertion
          (reputationDeleteRes.body.message).should.match('User is not authorized');

          // Handle Reputation error error
          done(reputationDeleteErr);
        });

    });
  });

  it('should be able to get a single Reputation that has an orphaned user reference', function (done) {
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

          // Save a new Reputation
          agent.post('/api/reputations')
            .send(reputation)
            .expect(200)
            .end(function (reputationSaveErr, reputationSaveRes) {
              // Handle Reputation save error
              if (reputationSaveErr) {
                return done(reputationSaveErr);
              }

              // Set assertions on new Reputation
              (reputationSaveRes.body.name).should.equal(reputation.name);
              should.exist(reputationSaveRes.body.user);
              should.equal(reputationSaveRes.body.user._id, orphanId);

              // force the Reputation to have an orphaned user reference
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

                    // Get the Reputation
                    agent.get('/api/reputations/' + reputationSaveRes.body._id)
                      .expect(200)
                      .end(function (reputationInfoErr, reputationInfoRes) {
                        // Handle Reputation error
                        if (reputationInfoErr) {
                          return done(reputationInfoErr);
                        }

                        // Set assertions
                        (reputationInfoRes.body._id).should.equal(reputationSaveRes.body._id);
                        (reputationInfoRes.body.name).should.equal(reputation.name);
                        should.equal(reputationInfoRes.body.user, undefined);

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
      Reputation.remove().exec(done);
    });
  });
});
