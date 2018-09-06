'use strict';

var should = require('should'),
  request = require('supertest'),
  path = require('path'),
  mongoose = require('mongoose'),
  User = mongoose.model('User'),
  Arbitration = mongoose.model('Arbitration'),
  express = require(path.resolve('./config/lib/express'));

/**
 * Globals
 */
var app,
  agent,
  credentials,
  user,
  arbitration;

/**
 * Arbitration routes tests
 */
describe('Arbitration CRUD tests', function () {

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

    // Save a user to the test db and create new Arbitration
    user.save(function () {
      arbitration = {
        name: 'Arbitration name'
      };

      done();
    });
  });

  it('should be able to save a Arbitration if logged in', function (done) {
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

        // Save a new Arbitration
        agent.post('/api/arbitrations')
          .send(arbitration)
          .expect(200)
          .end(function (arbitrationSaveErr, arbitrationSaveRes) {
            // Handle Arbitration save error
            if (arbitrationSaveErr) {
              return done(arbitrationSaveErr);
            }

            // Get a list of Arbitrations
            agent.get('/api/arbitrations')
              .end(function (arbitrationsGetErr, arbitrationsGetRes) {
                // Handle Arbitrations save error
                if (arbitrationsGetErr) {
                  return done(arbitrationsGetErr);
                }

                // Get Arbitrations list
                var arbitrations = arbitrationsGetRes.body;

                // Set assertions
                (arbitrations[0].user._id).should.equal(userId);
                (arbitrations[0].name).should.match('Arbitration name');

                // Call the assertion callback
                done();
              });
          });
      });
  });

  it('should not be able to save an Arbitration if not logged in', function (done) {
    agent.post('/api/arbitrations')
      .send(arbitration)
      .expect(403)
      .end(function (arbitrationSaveErr, arbitrationSaveRes) {
        // Call the assertion callback
        done(arbitrationSaveErr);
      });
  });

  it('should not be able to save an Arbitration if no name is provided', function (done) {
    // Invalidate name field
    arbitration.name = '';

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

        // Save a new Arbitration
        agent.post('/api/arbitrations')
          .send(arbitration)
          .expect(400)
          .end(function (arbitrationSaveErr, arbitrationSaveRes) {
            // Set message assertion
            (arbitrationSaveRes.body.message).should.match('Please fill Arbitration name');

            // Handle Arbitration save error
            done(arbitrationSaveErr);
          });
      });
  });

  it('should be able to update an Arbitration if signed in', function (done) {
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

        // Save a new Arbitration
        agent.post('/api/arbitrations')
          .send(arbitration)
          .expect(200)
          .end(function (arbitrationSaveErr, arbitrationSaveRes) {
            // Handle Arbitration save error
            if (arbitrationSaveErr) {
              return done(arbitrationSaveErr);
            }

            // Update Arbitration name
            arbitration.name = 'WHY YOU GOTTA BE SO MEAN?';

            // Update an existing Arbitration
            agent.put('/api/arbitrations/' + arbitrationSaveRes.body._id)
              .send(arbitration)
              .expect(200)
              .end(function (arbitrationUpdateErr, arbitrationUpdateRes) {
                // Handle Arbitration update error
                if (arbitrationUpdateErr) {
                  return done(arbitrationUpdateErr);
                }

                // Set assertions
                (arbitrationUpdateRes.body._id).should.equal(arbitrationSaveRes.body._id);
                (arbitrationUpdateRes.body.name).should.match('WHY YOU GOTTA BE SO MEAN?');

                // Call the assertion callback
                done();
              });
          });
      });
  });

  it('should be able to get a list of Arbitrations if not signed in', function (done) {
    // Create new Arbitration model instance
    var arbitrationObj = new Arbitration(arbitration);

    // Save the arbitration
    arbitrationObj.save(function () {
      // Request Arbitrations
      request(app).get('/api/arbitrations')
        .end(function (req, res) {
          // Set assertion
          res.body.should.be.instanceof(Array).and.have.lengthOf(1);

          // Call the assertion callback
          done();
        });

    });
  });

  it('should be able to get a single Arbitration if not signed in', function (done) {
    // Create new Arbitration model instance
    var arbitrationObj = new Arbitration(arbitration);

    // Save the Arbitration
    arbitrationObj.save(function () {
      request(app).get('/api/arbitrations/' + arbitrationObj._id)
        .end(function (req, res) {
          // Set assertion
          res.body.should.be.instanceof(Object).and.have.property('name', arbitration.name);

          // Call the assertion callback
          done();
        });
    });
  });

  it('should return proper error for single Arbitration with an invalid Id, if not signed in', function (done) {
    // test is not a valid mongoose Id
    request(app).get('/api/arbitrations/test')
      .end(function (req, res) {
        // Set assertion
        res.body.should.be.instanceof(Object).and.have.property('message', 'Arbitration is invalid');

        // Call the assertion callback
        done();
      });
  });

  it('should return proper error for single Arbitration which doesnt exist, if not signed in', function (done) {
    // This is a valid mongoose Id but a non-existent Arbitration
    request(app).get('/api/arbitrations/559e9cd815f80b4c256a8f41')
      .end(function (req, res) {
        // Set assertion
        res.body.should.be.instanceof(Object).and.have.property('message', 'No Arbitration with that identifier has been found');

        // Call the assertion callback
        done();
      });
  });

  it('should be able to delete an Arbitration if signed in', function (done) {
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

        // Save a new Arbitration
        agent.post('/api/arbitrations')
          .send(arbitration)
          .expect(200)
          .end(function (arbitrationSaveErr, arbitrationSaveRes) {
            // Handle Arbitration save error
            if (arbitrationSaveErr) {
              return done(arbitrationSaveErr);
            }

            // Delete an existing Arbitration
            agent.delete('/api/arbitrations/' + arbitrationSaveRes.body._id)
              .send(arbitration)
              .expect(200)
              .end(function (arbitrationDeleteErr, arbitrationDeleteRes) {
                // Handle arbitration error error
                if (arbitrationDeleteErr) {
                  return done(arbitrationDeleteErr);
                }

                // Set assertions
                (arbitrationDeleteRes.body._id).should.equal(arbitrationSaveRes.body._id);

                // Call the assertion callback
                done();
              });
          });
      });
  });

  it('should not be able to delete an Arbitration if not signed in', function (done) {
    // Set Arbitration user
    arbitration.user = user;

    // Create new Arbitration model instance
    var arbitrationObj = new Arbitration(arbitration);

    // Save the Arbitration
    arbitrationObj.save(function () {
      // Try deleting Arbitration
      request(app).delete('/api/arbitrations/' + arbitrationObj._id)
        .expect(403)
        .end(function (arbitrationDeleteErr, arbitrationDeleteRes) {
          // Set message assertion
          (arbitrationDeleteRes.body.message).should.match('User is not authorized');

          // Handle Arbitration error error
          done(arbitrationDeleteErr);
        });

    });
  });

  it('should be able to get a single Arbitration that has an orphaned user reference', function (done) {
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

          // Save a new Arbitration
          agent.post('/api/arbitrations')
            .send(arbitration)
            .expect(200)
            .end(function (arbitrationSaveErr, arbitrationSaveRes) {
              // Handle Arbitration save error
              if (arbitrationSaveErr) {
                return done(arbitrationSaveErr);
              }

              // Set assertions on new Arbitration
              (arbitrationSaveRes.body.name).should.equal(arbitration.name);
              should.exist(arbitrationSaveRes.body.user);
              should.equal(arbitrationSaveRes.body.user._id, orphanId);

              // force the Arbitration to have an orphaned user reference
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

                    // Get the Arbitration
                    agent.get('/api/arbitrations/' + arbitrationSaveRes.body._id)
                      .expect(200)
                      .end(function (arbitrationInfoErr, arbitrationInfoRes) {
                        // Handle Arbitration error
                        if (arbitrationInfoErr) {
                          return done(arbitrationInfoErr);
                        }

                        // Set assertions
                        (arbitrationInfoRes.body._id).should.equal(arbitrationSaveRes.body._id);
                        (arbitrationInfoRes.body.name).should.equal(arbitration.name);
                        should.equal(arbitrationInfoRes.body.user, undefined);

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
      Arbitration.remove().exec(done);
    });
  });
});
