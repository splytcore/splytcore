'use strict';

var should = require('should'),
  request = require('supertest'),
  path = require('path'),
  mongoose = require('mongoose'),
  User = mongoose.model('User'),
  Dashboard = mongoose.model('Dashboard'),
  express = require(path.resolve('./config/lib/express'));

/**
 * Globals
 */
var app,
  agent,
  credentials,
  user,
  dashboard;

/**
 * Dashboard routes tests
 */
describe('Dashboard CRUD tests', function () {

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

    // Save a user to the test db and create new Dashboard
    user.save(function () {
      dashboard = {
        name: 'Dashboard name'
      };

      done();
    });
  });

  it('should be able to save a Dashboard if logged in', function (done) {
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

        // Save a new Dashboard
        agent.post('/api/dashboards')
          .send(dashboard)
          .expect(200)
          .end(function (dashboardSaveErr, dashboardSaveRes) {
            // Handle Dashboard save error
            if (dashboardSaveErr) {
              return done(dashboardSaveErr);
            }

            // Get a list of Dashboards
            agent.get('/api/dashboards')
              .end(function (dashboardsGetErr, dashboardsGetRes) {
                // Handle Dashboards save error
                if (dashboardsGetErr) {
                  return done(dashboardsGetErr);
                }

                // Get Dashboards list
                var dashboards = dashboardsGetRes.body;

                // Set assertions
                (dashboards[0].user._id).should.equal(userId);
                (dashboards[0].name).should.match('Dashboard name');

                // Call the assertion callback
                done();
              });
          });
      });
  });

  it('should not be able to save an Dashboard if not logged in', function (done) {
    agent.post('/api/dashboards')
      .send(dashboard)
      .expect(403)
      .end(function (dashboardSaveErr, dashboardSaveRes) {
        // Call the assertion callback
        done(dashboardSaveErr);
      });
  });

  it('should not be able to save an Dashboard if no name is provided', function (done) {
    // Invalidate name field
    dashboard.name = '';

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

        // Save a new Dashboard
        agent.post('/api/dashboards')
          .send(dashboard)
          .expect(400)
          .end(function (dashboardSaveErr, dashboardSaveRes) {
            // Set message assertion
            (dashboardSaveRes.body.message).should.match('Please fill Dashboard name');

            // Handle Dashboard save error
            done(dashboardSaveErr);
          });
      });
  });

  it('should be able to update an Dashboard if signed in', function (done) {
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

        // Save a new Dashboard
        agent.post('/api/dashboards')
          .send(dashboard)
          .expect(200)
          .end(function (dashboardSaveErr, dashboardSaveRes) {
            // Handle Dashboard save error
            if (dashboardSaveErr) {
              return done(dashboardSaveErr);
            }

            // Update Dashboard name
            dashboard.name = 'WHY YOU GOTTA BE SO MEAN?';

            // Update an existing Dashboard
            agent.put('/api/dashboards/' + dashboardSaveRes.body._id)
              .send(dashboard)
              .expect(200)
              .end(function (dashboardUpdateErr, dashboardUpdateRes) {
                // Handle Dashboard update error
                if (dashboardUpdateErr) {
                  return done(dashboardUpdateErr);
                }

                // Set assertions
                (dashboardUpdateRes.body._id).should.equal(dashboardSaveRes.body._id);
                (dashboardUpdateRes.body.name).should.match('WHY YOU GOTTA BE SO MEAN?');

                // Call the assertion callback
                done();
              });
          });
      });
  });

  it('should be able to get a list of Dashboards if not signed in', function (done) {
    // Create new Dashboard model instance
    var dashboardObj = new Dashboard(dashboard);

    // Save the dashboard
    dashboardObj.save(function () {
      // Request Dashboards
      request(app).get('/api/dashboards')
        .end(function (req, res) {
          // Set assertion
          res.body.should.be.instanceof(Array).and.have.lengthOf(1);

          // Call the assertion callback
          done();
        });

    });
  });

  it('should be able to get a single Dashboard if not signed in', function (done) {
    // Create new Dashboard model instance
    var dashboardObj = new Dashboard(dashboard);

    // Save the Dashboard
    dashboardObj.save(function () {
      request(app).get('/api/dashboards/' + dashboardObj._id)
        .end(function (req, res) {
          // Set assertion
          res.body.should.be.instanceof(Object).and.have.property('name', dashboard.name);

          // Call the assertion callback
          done();
        });
    });
  });

  it('should return proper error for single Dashboard with an invalid Id, if not signed in', function (done) {
    // test is not a valid mongoose Id
    request(app).get('/api/dashboards/test')
      .end(function (req, res) {
        // Set assertion
        res.body.should.be.instanceof(Object).and.have.property('message', 'Dashboard is invalid');

        // Call the assertion callback
        done();
      });
  });

  it('should return proper error for single Dashboard which doesnt exist, if not signed in', function (done) {
    // This is a valid mongoose Id but a non-existent Dashboard
    request(app).get('/api/dashboards/559e9cd815f80b4c256a8f41')
      .end(function (req, res) {
        // Set assertion
        res.body.should.be.instanceof(Object).and.have.property('message', 'No Dashboard with that identifier has been found');

        // Call the assertion callback
        done();
      });
  });

  it('should be able to delete an Dashboard if signed in', function (done) {
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

        // Save a new Dashboard
        agent.post('/api/dashboards')
          .send(dashboard)
          .expect(200)
          .end(function (dashboardSaveErr, dashboardSaveRes) {
            // Handle Dashboard save error
            if (dashboardSaveErr) {
              return done(dashboardSaveErr);
            }

            // Delete an existing Dashboard
            agent.delete('/api/dashboards/' + dashboardSaveRes.body._id)
              .send(dashboard)
              .expect(200)
              .end(function (dashboardDeleteErr, dashboardDeleteRes) {
                // Handle dashboard error error
                if (dashboardDeleteErr) {
                  return done(dashboardDeleteErr);
                }

                // Set assertions
                (dashboardDeleteRes.body._id).should.equal(dashboardSaveRes.body._id);

                // Call the assertion callback
                done();
              });
          });
      });
  });

  it('should not be able to delete an Dashboard if not signed in', function (done) {
    // Set Dashboard user
    dashboard.user = user;

    // Create new Dashboard model instance
    var dashboardObj = new Dashboard(dashboard);

    // Save the Dashboard
    dashboardObj.save(function () {
      // Try deleting Dashboard
      request(app).delete('/api/dashboards/' + dashboardObj._id)
        .expect(403)
        .end(function (dashboardDeleteErr, dashboardDeleteRes) {
          // Set message assertion
          (dashboardDeleteRes.body.message).should.match('User is not authorized');

          // Handle Dashboard error error
          done(dashboardDeleteErr);
        });

    });
  });

  it('should be able to get a single Dashboard that has an orphaned user reference', function (done) {
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

          // Save a new Dashboard
          agent.post('/api/dashboards')
            .send(dashboard)
            .expect(200)
            .end(function (dashboardSaveErr, dashboardSaveRes) {
              // Handle Dashboard save error
              if (dashboardSaveErr) {
                return done(dashboardSaveErr);
              }

              // Set assertions on new Dashboard
              (dashboardSaveRes.body.name).should.equal(dashboard.name);
              should.exist(dashboardSaveRes.body.user);
              should.equal(dashboardSaveRes.body.user._id, orphanId);

              // force the Dashboard to have an orphaned user reference
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

                    // Get the Dashboard
                    agent.get('/api/dashboards/' + dashboardSaveRes.body._id)
                      .expect(200)
                      .end(function (dashboardInfoErr, dashboardInfoRes) {
                        // Handle Dashboard error
                        if (dashboardInfoErr) {
                          return done(dashboardInfoErr);
                        }

                        // Set assertions
                        (dashboardInfoRes.body._id).should.equal(dashboardSaveRes.body._id);
                        (dashboardInfoRes.body.name).should.equal(dashboard.name);
                        should.equal(dashboardInfoRes.body.user, undefined);

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
      Dashboard.remove().exec(done);
    });
  });
});
