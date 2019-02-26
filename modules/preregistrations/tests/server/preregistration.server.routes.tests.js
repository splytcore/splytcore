'use strict';

var should = require('should'),
  request = require('supertest'),
  path = require('path'),
  mongoose = require('mongoose'),
  User = mongoose.model('User'),
  Preregistration = mongoose.model('Preregistration'),
  express = require(path.resolve('./config/lib/express'));

/**
 * Globals
 */
var app,
  agent,
  credentials,
  user,
  preregistration;

/**
 * Preregistration routes tests
 */
describe('Preregistration CRUD tests', function () {

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

    // Save a user to the test db and create new Preregistration
    user.save(function () {
      preregistration = {
        name: 'Preregistration name'
      };

      done();
    });
  });

  it('should be able to save a Preregistration if logged in', function (done) {
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

        // Save a new Preregistration
        agent.post('/api/preregistrations')
          .send(preregistration)
          .expect(200)
          .end(function (preregistrationSaveErr, preregistrationSaveRes) {
            // Handle Preregistration save error
            if (preregistrationSaveErr) {
              return done(preregistrationSaveErr);
            }

            // Get a list of Preregistrations
            agent.get('/api/preregistrations')
              .end(function (preregistrationsGetErr, preregistrationsGetRes) {
                // Handle Preregistrations save error
                if (preregistrationsGetErr) {
                  return done(preregistrationsGetErr);
                }

                // Get Preregistrations list
                var preregistrations = preregistrationsGetRes.body;

                // Set assertions
                (preregistrations[0].user._id).should.equal(userId);
                (preregistrations[0].name).should.match('Preregistration name');

                // Call the assertion callback
                done();
              });
          });
      });
  });

  it('should not be able to save an Preregistration if not logged in', function (done) {
    agent.post('/api/preregistrations')
      .send(preregistration)
      .expect(403)
      .end(function (preregistrationSaveErr, preregistrationSaveRes) {
        // Call the assertion callback
        done(preregistrationSaveErr);
      });
  });

  it('should not be able to save an Preregistration if no name is provided', function (done) {
    // Invalidate name field
    preregistration.name = '';

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

        // Save a new Preregistration
        agent.post('/api/preregistrations')
          .send(preregistration)
          .expect(400)
          .end(function (preregistrationSaveErr, preregistrationSaveRes) {
            // Set message assertion
            (preregistrationSaveRes.body.message).should.match('Please fill Preregistration name');

            // Handle Preregistration save error
            done(preregistrationSaveErr);
          });
      });
  });

  it('should be able to update an Preregistration if signed in', function (done) {
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

        // Save a new Preregistration
        agent.post('/api/preregistrations')
          .send(preregistration)
          .expect(200)
          .end(function (preregistrationSaveErr, preregistrationSaveRes) {
            // Handle Preregistration save error
            if (preregistrationSaveErr) {
              return done(preregistrationSaveErr);
            }

            // Update Preregistration name
            preregistration.name = 'WHY YOU GOTTA BE SO MEAN?';

            // Update an existing Preregistration
            agent.put('/api/preregistrations/' + preregistrationSaveRes.body._id)
              .send(preregistration)
              .expect(200)
              .end(function (preregistrationUpdateErr, preregistrationUpdateRes) {
                // Handle Preregistration update error
                if (preregistrationUpdateErr) {
                  return done(preregistrationUpdateErr);
                }

                // Set assertions
                (preregistrationUpdateRes.body._id).should.equal(preregistrationSaveRes.body._id);
                (preregistrationUpdateRes.body.name).should.match('WHY YOU GOTTA BE SO MEAN?');

                // Call the assertion callback
                done();
              });
          });
      });
  });

  it('should be able to get a list of Preregistrations if not signed in', function (done) {
    // Create new Preregistration model instance
    var preregistrationObj = new Preregistration(preregistration);

    // Save the preregistration
    preregistrationObj.save(function () {
      // Request Preregistrations
      request(app).get('/api/preregistrations')
        .end(function (req, res) {
          // Set assertion
          res.body.should.be.instanceof(Array).and.have.lengthOf(1);

          // Call the assertion callback
          done();
        });

    });
  });

  it('should be able to get a single Preregistration if not signed in', function (done) {
    // Create new Preregistration model instance
    var preregistrationObj = new Preregistration(preregistration);

    // Save the Preregistration
    preregistrationObj.save(function () {
      request(app).get('/api/preregistrations/' + preregistrationObj._id)
        .end(function (req, res) {
          // Set assertion
          res.body.should.be.instanceof(Object).and.have.property('name', preregistration.name);

          // Call the assertion callback
          done();
        });
    });
  });

  it('should return proper error for single Preregistration with an invalid Id, if not signed in', function (done) {
    // test is not a valid mongoose Id
    request(app).get('/api/preregistrations/test')
      .end(function (req, res) {
        // Set assertion
        res.body.should.be.instanceof(Object).and.have.property('message', 'Preregistration is invalid');

        // Call the assertion callback
        done();
      });
  });

  it('should return proper error for single Preregistration which doesnt exist, if not signed in', function (done) {
    // This is a valid mongoose Id but a non-existent Preregistration
    request(app).get('/api/preregistrations/559e9cd815f80b4c256a8f41')
      .end(function (req, res) {
        // Set assertion
        res.body.should.be.instanceof(Object).and.have.property('message', 'No Preregistration with that identifier has been found');

        // Call the assertion callback
        done();
      });
  });

  it('should be able to delete an Preregistration if signed in', function (done) {
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

        // Save a new Preregistration
        agent.post('/api/preregistrations')
          .send(preregistration)
          .expect(200)
          .end(function (preregistrationSaveErr, preregistrationSaveRes) {
            // Handle Preregistration save error
            if (preregistrationSaveErr) {
              return done(preregistrationSaveErr);
            }

            // Delete an existing Preregistration
            agent.delete('/api/preregistrations/' + preregistrationSaveRes.body._id)
              .send(preregistration)
              .expect(200)
              .end(function (preregistrationDeleteErr, preregistrationDeleteRes) {
                // Handle preregistration error error
                if (preregistrationDeleteErr) {
                  return done(preregistrationDeleteErr);
                }

                // Set assertions
                (preregistrationDeleteRes.body._id).should.equal(preregistrationSaveRes.body._id);

                // Call the assertion callback
                done();
              });
          });
      });
  });

  it('should not be able to delete an Preregistration if not signed in', function (done) {
    // Set Preregistration user
    preregistration.user = user;

    // Create new Preregistration model instance
    var preregistrationObj = new Preregistration(preregistration);

    // Save the Preregistration
    preregistrationObj.save(function () {
      // Try deleting Preregistration
      request(app).delete('/api/preregistrations/' + preregistrationObj._id)
        .expect(403)
        .end(function (preregistrationDeleteErr, preregistrationDeleteRes) {
          // Set message assertion
          (preregistrationDeleteRes.body.message).should.match('User is not authorized');

          // Handle Preregistration error error
          done(preregistrationDeleteErr);
        });

    });
  });

  it('should be able to get a single Preregistration that has an orphaned user reference', function (done) {
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

          // Save a new Preregistration
          agent.post('/api/preregistrations')
            .send(preregistration)
            .expect(200)
            .end(function (preregistrationSaveErr, preregistrationSaveRes) {
              // Handle Preregistration save error
              if (preregistrationSaveErr) {
                return done(preregistrationSaveErr);
              }

              // Set assertions on new Preregistration
              (preregistrationSaveRes.body.name).should.equal(preregistration.name);
              should.exist(preregistrationSaveRes.body.user);
              should.equal(preregistrationSaveRes.body.user._id, orphanId);

              // force the Preregistration to have an orphaned user reference
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

                    // Get the Preregistration
                    agent.get('/api/preregistrations/' + preregistrationSaveRes.body._id)
                      .expect(200)
                      .end(function (preregistrationInfoErr, preregistrationInfoRes) {
                        // Handle Preregistration error
                        if (preregistrationInfoErr) {
                          return done(preregistrationInfoErr);
                        }

                        // Set assertions
                        (preregistrationInfoRes.body._id).should.equal(preregistrationSaveRes.body._id);
                        (preregistrationInfoRes.body.name).should.equal(preregistration.name);
                        should.equal(preregistrationInfoRes.body.user, undefined);

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
      Preregistration.remove().exec(done);
    });
  });
});
