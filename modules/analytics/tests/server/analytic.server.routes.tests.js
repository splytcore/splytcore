'use strict';

var should = require('should'),
  request = require('supertest'),
  path = require('path'),
  mongoose = require('mongoose'),
  User = mongoose.model('User'),
  Analytic = mongoose.model('Analytic'),
  express = require(path.resolve('./config/lib/express'));

/**
 * Globals
 */
var app,
  agent,
  credentials,
  user,
  analytic;

/**
 * Analytic routes tests
 */
describe('Analytic CRUD tests', function () {

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

    // Save a user to the test db and create new Analytic
    user.save(function () {
      analytic = {
        name: 'Analytic name'
      };

      done();
    });
  });

  it('should be able to save a Analytic if logged in', function (done) {
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

        // Save a new Analytic
        agent.post('/api/analytics')
          .send(analytic)
          .expect(200)
          .end(function (analyticSaveErr, analyticSaveRes) {
            // Handle Analytic save error
            if (analyticSaveErr) {
              return done(analyticSaveErr);
            }

            // Get a list of Analytics
            agent.get('/api/analytics')
              .end(function (analyticsGetErr, analyticsGetRes) {
                // Handle Analytics save error
                if (analyticsGetErr) {
                  return done(analyticsGetErr);
                }

                // Get Analytics list
                var analytics = analyticsGetRes.body;

                // Set assertions
                (analytics[0].user._id).should.equal(userId);
                (analytics[0].name).should.match('Analytic name');

                // Call the assertion callback
                done();
              });
          });
      });
  });

  it('should not be able to save an Analytic if not logged in', function (done) {
    agent.post('/api/analytics')
      .send(analytic)
      .expect(403)
      .end(function (analyticSaveErr, analyticSaveRes) {
        // Call the assertion callback
        done(analyticSaveErr);
      });
  });

  it('should not be able to save an Analytic if no name is provided', function (done) {
    // Invalidate name field
    analytic.name = '';

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

        // Save a new Analytic
        agent.post('/api/analytics')
          .send(analytic)
          .expect(400)
          .end(function (analyticSaveErr, analyticSaveRes) {
            // Set message assertion
            (analyticSaveRes.body.message).should.match('Please fill Analytic name');

            // Handle Analytic save error
            done(analyticSaveErr);
          });
      });
  });

  it('should be able to update an Analytic if signed in', function (done) {
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

        // Save a new Analytic
        agent.post('/api/analytics')
          .send(analytic)
          .expect(200)
          .end(function (analyticSaveErr, analyticSaveRes) {
            // Handle Analytic save error
            if (analyticSaveErr) {
              return done(analyticSaveErr);
            }

            // Update Analytic name
            analytic.name = 'WHY YOU GOTTA BE SO MEAN?';

            // Update an existing Analytic
            agent.put('/api/analytics/' + analyticSaveRes.body._id)
              .send(analytic)
              .expect(200)
              .end(function (analyticUpdateErr, analyticUpdateRes) {
                // Handle Analytic update error
                if (analyticUpdateErr) {
                  return done(analyticUpdateErr);
                }

                // Set assertions
                (analyticUpdateRes.body._id).should.equal(analyticSaveRes.body._id);
                (analyticUpdateRes.body.name).should.match('WHY YOU GOTTA BE SO MEAN?');

                // Call the assertion callback
                done();
              });
          });
      });
  });

  it('should be able to get a list of Analytics if not signed in', function (done) {
    // Create new Analytic model instance
    var analyticObj = new Analytic(analytic);

    // Save the analytic
    analyticObj.save(function () {
      // Request Analytics
      request(app).get('/api/analytics')
        .end(function (req, res) {
          // Set assertion
          res.body.should.be.instanceof(Array).and.have.lengthOf(1);

          // Call the assertion callback
          done();
        });

    });
  });

  it('should be able to get a single Analytic if not signed in', function (done) {
    // Create new Analytic model instance
    var analyticObj = new Analytic(analytic);

    // Save the Analytic
    analyticObj.save(function () {
      request(app).get('/api/analytics/' + analyticObj._id)
        .end(function (req, res) {
          // Set assertion
          res.body.should.be.instanceof(Object).and.have.property('name', analytic.name);

          // Call the assertion callback
          done();
        });
    });
  });

  it('should return proper error for single Analytic with an invalid Id, if not signed in', function (done) {
    // test is not a valid mongoose Id
    request(app).get('/api/analytics/test')
      .end(function (req, res) {
        // Set assertion
        res.body.should.be.instanceof(Object).and.have.property('message', 'Analytic is invalid');

        // Call the assertion callback
        done();
      });
  });

  it('should return proper error for single Analytic which doesnt exist, if not signed in', function (done) {
    // This is a valid mongoose Id but a non-existent Analytic
    request(app).get('/api/analytics/559e9cd815f80b4c256a8f41')
      .end(function (req, res) {
        // Set assertion
        res.body.should.be.instanceof(Object).and.have.property('message', 'No Analytic with that identifier has been found');

        // Call the assertion callback
        done();
      });
  });

  it('should be able to delete an Analytic if signed in', function (done) {
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

        // Save a new Analytic
        agent.post('/api/analytics')
          .send(analytic)
          .expect(200)
          .end(function (analyticSaveErr, analyticSaveRes) {
            // Handle Analytic save error
            if (analyticSaveErr) {
              return done(analyticSaveErr);
            }

            // Delete an existing Analytic
            agent.delete('/api/analytics/' + analyticSaveRes.body._id)
              .send(analytic)
              .expect(200)
              .end(function (analyticDeleteErr, analyticDeleteRes) {
                // Handle analytic error error
                if (analyticDeleteErr) {
                  return done(analyticDeleteErr);
                }

                // Set assertions
                (analyticDeleteRes.body._id).should.equal(analyticSaveRes.body._id);

                // Call the assertion callback
                done();
              });
          });
      });
  });

  it('should not be able to delete an Analytic if not signed in', function (done) {
    // Set Analytic user
    analytic.user = user;

    // Create new Analytic model instance
    var analyticObj = new Analytic(analytic);

    // Save the Analytic
    analyticObj.save(function () {
      // Try deleting Analytic
      request(app).delete('/api/analytics/' + analyticObj._id)
        .expect(403)
        .end(function (analyticDeleteErr, analyticDeleteRes) {
          // Set message assertion
          (analyticDeleteRes.body.message).should.match('User is not authorized');

          // Handle Analytic error error
          done(analyticDeleteErr);
        });

    });
  });

  it('should be able to get a single Analytic that has an orphaned user reference', function (done) {
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

          // Save a new Analytic
          agent.post('/api/analytics')
            .send(analytic)
            .expect(200)
            .end(function (analyticSaveErr, analyticSaveRes) {
              // Handle Analytic save error
              if (analyticSaveErr) {
                return done(analyticSaveErr);
              }

              // Set assertions on new Analytic
              (analyticSaveRes.body.name).should.equal(analytic.name);
              should.exist(analyticSaveRes.body.user);
              should.equal(analyticSaveRes.body.user._id, orphanId);

              // force the Analytic to have an orphaned user reference
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

                    // Get the Analytic
                    agent.get('/api/analytics/' + analyticSaveRes.body._id)
                      .expect(200)
                      .end(function (analyticInfoErr, analyticInfoRes) {
                        // Handle Analytic error
                        if (analyticInfoErr) {
                          return done(analyticInfoErr);
                        }

                        // Set assertions
                        (analyticInfoRes.body._id).should.equal(analyticSaveRes.body._id);
                        (analyticInfoRes.body.name).should.equal(analytic.name);
                        should.equal(analyticInfoRes.body.user, undefined);

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
      Analytic.remove().exec(done);
    });
  });
});
