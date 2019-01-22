'use strict';

var should = require('should'),
  request = require('supertest'),
  path = require('path'),
  mongoose = require('mongoose'),
  User = mongoose.model('User'),
  Stripe = mongoose.model('Stripe'),
  express = require(path.resolve('./config/lib/express'));

/**
 * Globals
 */
var app,
  agent,
  credentials,
  user,
  stripe;

/**
 * Stripe routes tests
 */
describe('Stripe CRUD tests', function () {

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

    // Save a user to the test db and create new Stripe
    user.save(function () {
      stripe = {
        name: 'Stripe name'
      };

      done();
    });
  });

  it('should be able to save a Stripe if logged in', function (done) {
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

        // Save a new Stripe
        agent.post('/api/stripes')
          .send(stripe)
          .expect(200)
          .end(function (stripeSaveErr, stripeSaveRes) {
            // Handle Stripe save error
            if (stripeSaveErr) {
              return done(stripeSaveErr);
            }

            // Get a list of Stripes
            agent.get('/api/stripes')
              .end(function (stripesGetErr, stripesGetRes) {
                // Handle Stripes save error
                if (stripesGetErr) {
                  return done(stripesGetErr);
                }

                // Get Stripes list
                var stripes = stripesGetRes.body;

                // Set assertions
                (stripes[0].user._id).should.equal(userId);
                (stripes[0].name).should.match('Stripe name');

                // Call the assertion callback
                done();
              });
          });
      });
  });

  it('should not be able to save an Stripe if not logged in', function (done) {
    agent.post('/api/stripes')
      .send(stripe)
      .expect(403)
      .end(function (stripeSaveErr, stripeSaveRes) {
        // Call the assertion callback
        done(stripeSaveErr);
      });
  });

  it('should not be able to save an Stripe if no name is provided', function (done) {
    // Invalidate name field
    stripe.name = '';

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

        // Save a new Stripe
        agent.post('/api/stripes')
          .send(stripe)
          .expect(400)
          .end(function (stripeSaveErr, stripeSaveRes) {
            // Set message assertion
            (stripeSaveRes.body.message).should.match('Please fill Stripe name');

            // Handle Stripe save error
            done(stripeSaveErr);
          });
      });
  });

  it('should be able to update an Stripe if signed in', function (done) {
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

        // Save a new Stripe
        agent.post('/api/stripes')
          .send(stripe)
          .expect(200)
          .end(function (stripeSaveErr, stripeSaveRes) {
            // Handle Stripe save error
            if (stripeSaveErr) {
              return done(stripeSaveErr);
            }

            // Update Stripe name
            stripe.name = 'WHY YOU GOTTA BE SO MEAN?';

            // Update an existing Stripe
            agent.put('/api/stripes/' + stripeSaveRes.body._id)
              .send(stripe)
              .expect(200)
              .end(function (stripeUpdateErr, stripeUpdateRes) {
                // Handle Stripe update error
                if (stripeUpdateErr) {
                  return done(stripeUpdateErr);
                }

                // Set assertions
                (stripeUpdateRes.body._id).should.equal(stripeSaveRes.body._id);
                (stripeUpdateRes.body.name).should.match('WHY YOU GOTTA BE SO MEAN?');

                // Call the assertion callback
                done();
              });
          });
      });
  });

  it('should be able to get a list of Stripes if not signed in', function (done) {
    // Create new Stripe model instance
    var stripeObj = new Stripe(stripe);

    // Save the stripe
    stripeObj.save(function () {
      // Request Stripes
      request(app).get('/api/stripes')
        .end(function (req, res) {
          // Set assertion
          res.body.should.be.instanceof(Array).and.have.lengthOf(1);

          // Call the assertion callback
          done();
        });

    });
  });

  it('should be able to get a single Stripe if not signed in', function (done) {
    // Create new Stripe model instance
    var stripeObj = new Stripe(stripe);

    // Save the Stripe
    stripeObj.save(function () {
      request(app).get('/api/stripes/' + stripeObj._id)
        .end(function (req, res) {
          // Set assertion
          res.body.should.be.instanceof(Object).and.have.property('name', stripe.name);

          // Call the assertion callback
          done();
        });
    });
  });

  it('should return proper error for single Stripe with an invalid Id, if not signed in', function (done) {
    // test is not a valid mongoose Id
    request(app).get('/api/stripes/test')
      .end(function (req, res) {
        // Set assertion
        res.body.should.be.instanceof(Object).and.have.property('message', 'Stripe is invalid');

        // Call the assertion callback
        done();
      });
  });

  it('should return proper error for single Stripe which doesnt exist, if not signed in', function (done) {
    // This is a valid mongoose Id but a non-existent Stripe
    request(app).get('/api/stripes/559e9cd815f80b4c256a8f41')
      .end(function (req, res) {
        // Set assertion
        res.body.should.be.instanceof(Object).and.have.property('message', 'No Stripe with that identifier has been found');

        // Call the assertion callback
        done();
      });
  });

  it('should be able to delete an Stripe if signed in', function (done) {
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

        // Save a new Stripe
        agent.post('/api/stripes')
          .send(stripe)
          .expect(200)
          .end(function (stripeSaveErr, stripeSaveRes) {
            // Handle Stripe save error
            if (stripeSaveErr) {
              return done(stripeSaveErr);
            }

            // Delete an existing Stripe
            agent.delete('/api/stripes/' + stripeSaveRes.body._id)
              .send(stripe)
              .expect(200)
              .end(function (stripeDeleteErr, stripeDeleteRes) {
                // Handle stripe error error
                if (stripeDeleteErr) {
                  return done(stripeDeleteErr);
                }

                // Set assertions
                (stripeDeleteRes.body._id).should.equal(stripeSaveRes.body._id);

                // Call the assertion callback
                done();
              });
          });
      });
  });

  it('should not be able to delete an Stripe if not signed in', function (done) {
    // Set Stripe user
    stripe.user = user;

    // Create new Stripe model instance
    var stripeObj = new Stripe(stripe);

    // Save the Stripe
    stripeObj.save(function () {
      // Try deleting Stripe
      request(app).delete('/api/stripes/' + stripeObj._id)
        .expect(403)
        .end(function (stripeDeleteErr, stripeDeleteRes) {
          // Set message assertion
          (stripeDeleteRes.body.message).should.match('User is not authorized');

          // Handle Stripe error error
          done(stripeDeleteErr);
        });

    });
  });

  it('should be able to get a single Stripe that has an orphaned user reference', function (done) {
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

          // Save a new Stripe
          agent.post('/api/stripes')
            .send(stripe)
            .expect(200)
            .end(function (stripeSaveErr, stripeSaveRes) {
              // Handle Stripe save error
              if (stripeSaveErr) {
                return done(stripeSaveErr);
              }

              // Set assertions on new Stripe
              (stripeSaveRes.body.name).should.equal(stripe.name);
              should.exist(stripeSaveRes.body.user);
              should.equal(stripeSaveRes.body.user._id, orphanId);

              // force the Stripe to have an orphaned user reference
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

                    // Get the Stripe
                    agent.get('/api/stripes/' + stripeSaveRes.body._id)
                      .expect(200)
                      .end(function (stripeInfoErr, stripeInfoRes) {
                        // Handle Stripe error
                        if (stripeInfoErr) {
                          return done(stripeInfoErr);
                        }

                        // Set assertions
                        (stripeInfoRes.body._id).should.equal(stripeSaveRes.body._id);
                        (stripeInfoRes.body.name).should.equal(stripe.name);
                        should.equal(stripeInfoRes.body.user, undefined);

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
      Stripe.remove().exec(done);
    });
  });
});
