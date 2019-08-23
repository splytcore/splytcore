'use strict';

var should = require('should'),
  request = require('supertest'),
  path = require('path'),
  mongoose = require('mongoose'),
  User = mongoose.model('User'),
  Shopify = mongoose.model('Shopify'),
  express = require(path.resolve('./config/lib/express'));

/**
 * Globals
 */
var app,
  agent,
  credentials,
  user,
  shopify;

/**
 * Shopify routes tests
 */
describe('Shopify CRUD tests', function () {

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

    // Save a user to the test db and create new Shopify
    user.save(function () {
      shopify = {
        name: 'Shopify name'
      };

      done();
    });
  });

  it('should be able to save a Shopify if logged in', function (done) {
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

        // Save a new Shopify
        agent.post('/api/shopifies')
          .send(shopify)
          .expect(200)
          .end(function (shopifySaveErr, shopifySaveRes) {
            // Handle Shopify save error
            if (shopifySaveErr) {
              return done(shopifySaveErr);
            }

            // Get a list of Shopifies
            agent.get('/api/shopifies')
              .end(function (shopifiesGetErr, shopifiesGetRes) {
                // Handle Shopifies save error
                if (shopifiesGetErr) {
                  return done(shopifiesGetErr);
                }

                // Get Shopifies list
                var shopifies = shopifiesGetRes.body;

                // Set assertions
                (shopifies[0].user._id).should.equal(userId);
                (shopifies[0].name).should.match('Shopify name');

                // Call the assertion callback
                done();
              });
          });
      });
  });

  it('should not be able to save an Shopify if not logged in', function (done) {
    agent.post('/api/shopifies')
      .send(shopify)
      .expect(403)
      .end(function (shopifySaveErr, shopifySaveRes) {
        // Call the assertion callback
        done(shopifySaveErr);
      });
  });

  it('should not be able to save an Shopify if no name is provided', function (done) {
    // Invalidate name field
    shopify.name = '';

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

        // Save a new Shopify
        agent.post('/api/shopifies')
          .send(shopify)
          .expect(400)
          .end(function (shopifySaveErr, shopifySaveRes) {
            // Set message assertion
            (shopifySaveRes.body.message).should.match('Please fill Shopify name');

            // Handle Shopify save error
            done(shopifySaveErr);
          });
      });
  });

  it('should be able to update an Shopify if signed in', function (done) {
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

        // Save a new Shopify
        agent.post('/api/shopifies')
          .send(shopify)
          .expect(200)
          .end(function (shopifySaveErr, shopifySaveRes) {
            // Handle Shopify save error
            if (shopifySaveErr) {
              return done(shopifySaveErr);
            }

            // Update Shopify name
            shopify.name = 'WHY YOU GOTTA BE SO MEAN?';

            // Update an existing Shopify
            agent.put('/api/shopifies/' + shopifySaveRes.body._id)
              .send(shopify)
              .expect(200)
              .end(function (shopifyUpdateErr, shopifyUpdateRes) {
                // Handle Shopify update error
                if (shopifyUpdateErr) {
                  return done(shopifyUpdateErr);
                }

                // Set assertions
                (shopifyUpdateRes.body._id).should.equal(shopifySaveRes.body._id);
                (shopifyUpdateRes.body.name).should.match('WHY YOU GOTTA BE SO MEAN?');

                // Call the assertion callback
                done();
              });
          });
      });
  });

  it('should be able to get a list of Shopifies if not signed in', function (done) {
    // Create new Shopify model instance
    var shopifyObj = new Shopify(shopify);

    // Save the shopify
    shopifyObj.save(function () {
      // Request Shopifies
      request(app).get('/api/shopifies')
        .end(function (req, res) {
          // Set assertion
          res.body.should.be.instanceof(Array).and.have.lengthOf(1);

          // Call the assertion callback
          done();
        });

    });
  });

  it('should be able to get a single Shopify if not signed in', function (done) {
    // Create new Shopify model instance
    var shopifyObj = new Shopify(shopify);

    // Save the Shopify
    shopifyObj.save(function () {
      request(app).get('/api/shopifies/' + shopifyObj._id)
        .end(function (req, res) {
          // Set assertion
          res.body.should.be.instanceof(Object).and.have.property('name', shopify.name);

          // Call the assertion callback
          done();
        });
    });
  });

  it('should return proper error for single Shopify with an invalid Id, if not signed in', function (done) {
    // test is not a valid mongoose Id
    request(app).get('/api/shopifies/test')
      .end(function (req, res) {
        // Set assertion
        res.body.should.be.instanceof(Object).and.have.property('message', 'Shopify is invalid');

        // Call the assertion callback
        done();
      });
  });

  it('should return proper error for single Shopify which doesnt exist, if not signed in', function (done) {
    // This is a valid mongoose Id but a non-existent Shopify
    request(app).get('/api/shopifies/559e9cd815f80b4c256a8f41')
      .end(function (req, res) {
        // Set assertion
        res.body.should.be.instanceof(Object).and.have.property('message', 'No Shopify with that identifier has been found');

        // Call the assertion callback
        done();
      });
  });

  it('should be able to delete an Shopify if signed in', function (done) {
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

        // Save a new Shopify
        agent.post('/api/shopifies')
          .send(shopify)
          .expect(200)
          .end(function (shopifySaveErr, shopifySaveRes) {
            // Handle Shopify save error
            if (shopifySaveErr) {
              return done(shopifySaveErr);
            }

            // Delete an existing Shopify
            agent.delete('/api/shopifies/' + shopifySaveRes.body._id)
              .send(shopify)
              .expect(200)
              .end(function (shopifyDeleteErr, shopifyDeleteRes) {
                // Handle shopify error error
                if (shopifyDeleteErr) {
                  return done(shopifyDeleteErr);
                }

                // Set assertions
                (shopifyDeleteRes.body._id).should.equal(shopifySaveRes.body._id);

                // Call the assertion callback
                done();
              });
          });
      });
  });

  it('should not be able to delete an Shopify if not signed in', function (done) {
    // Set Shopify user
    shopify.user = user;

    // Create new Shopify model instance
    var shopifyObj = new Shopify(shopify);

    // Save the Shopify
    shopifyObj.save(function () {
      // Try deleting Shopify
      request(app).delete('/api/shopifies/' + shopifyObj._id)
        .expect(403)
        .end(function (shopifyDeleteErr, shopifyDeleteRes) {
          // Set message assertion
          (shopifyDeleteRes.body.message).should.match('User is not authorized');

          // Handle Shopify error error
          done(shopifyDeleteErr);
        });

    });
  });

  it('should be able to get a single Shopify that has an orphaned user reference', function (done) {
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

          // Save a new Shopify
          agent.post('/api/shopifies')
            .send(shopify)
            .expect(200)
            .end(function (shopifySaveErr, shopifySaveRes) {
              // Handle Shopify save error
              if (shopifySaveErr) {
                return done(shopifySaveErr);
              }

              // Set assertions on new Shopify
              (shopifySaveRes.body.name).should.equal(shopify.name);
              should.exist(shopifySaveRes.body.user);
              should.equal(shopifySaveRes.body.user._id, orphanId);

              // force the Shopify to have an orphaned user reference
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

                    // Get the Shopify
                    agent.get('/api/shopifies/' + shopifySaveRes.body._id)
                      .expect(200)
                      .end(function (shopifyInfoErr, shopifyInfoRes) {
                        // Handle Shopify error
                        if (shopifyInfoErr) {
                          return done(shopifyInfoErr);
                        }

                        // Set assertions
                        (shopifyInfoRes.body._id).should.equal(shopifySaveRes.body._id);
                        (shopifyInfoRes.body.name).should.equal(shopify.name);
                        should.equal(shopifyInfoRes.body.user, undefined);

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
      Shopify.remove().exec(done);
    });
  });
});
