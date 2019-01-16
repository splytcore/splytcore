'use strict';

var should = require('should'),
  request = require('supertest'),
  path = require('path'),
  mongoose = require('mongoose'),
  User = mongoose.model('User'),
  Store = mongoose.model('Store'),
  express = require(path.resolve('./config/lib/express'));

/**
 * Globals
 */
var app,
  agent,
  credentials,
  user,
  store;

/**
 * Store routes tests
 */
describe('Store CRUD tests', function () {

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

    // Save a user to the test db and create new Store
    user.save(function () {
      store = {
        name: 'Store name'
      };

      done();
    });
  });

  it('should be able to save a Store if logged in', function (done) {
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

        // Save a new Store
        agent.post('/api/stores')
          .send(store)
          .expect(200)
          .end(function (storeSaveErr, storeSaveRes) {
            // Handle Store save error
            if (storeSaveErr) {
              return done(storeSaveErr);
            }

            // Get a list of Stores
            agent.get('/api/stores')
              .end(function (storesGetErr, storesGetRes) {
                // Handle Stores save error
                if (storesGetErr) {
                  return done(storesGetErr);
                }

                // Get Stores list
                var stores = storesGetRes.body;

                // Set assertions
                (stores[0].user._id).should.equal(userId);
                (stores[0].name).should.match('Store name');

                // Call the assertion callback
                done();
              });
          });
      });
  });

  it('should not be able to save an Store if not logged in', function (done) {
    agent.post('/api/stores')
      .send(store)
      .expect(403)
      .end(function (storeSaveErr, storeSaveRes) {
        // Call the assertion callback
        done(storeSaveErr);
      });
  });

  it('should not be able to save an Store if no name is provided', function (done) {
    // Invalidate name field
    store.name = '';

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

        // Save a new Store
        agent.post('/api/stores')
          .send(store)
          .expect(400)
          .end(function (storeSaveErr, storeSaveRes) {
            // Set message assertion
            (storeSaveRes.body.message).should.match('Please fill Store name');

            // Handle Store save error
            done(storeSaveErr);
          });
      });
  });

  it('should be able to update an Store if signed in', function (done) {
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

        // Save a new Store
        agent.post('/api/stores')
          .send(store)
          .expect(200)
          .end(function (storeSaveErr, storeSaveRes) {
            // Handle Store save error
            if (storeSaveErr) {
              return done(storeSaveErr);
            }

            // Update Store name
            store.name = 'WHY YOU GOTTA BE SO MEAN?';

            // Update an existing Store
            agent.put('/api/stores/' + storeSaveRes.body._id)
              .send(store)
              .expect(200)
              .end(function (storeUpdateErr, storeUpdateRes) {
                // Handle Store update error
                if (storeUpdateErr) {
                  return done(storeUpdateErr);
                }

                // Set assertions
                (storeUpdateRes.body._id).should.equal(storeSaveRes.body._id);
                (storeUpdateRes.body.name).should.match('WHY YOU GOTTA BE SO MEAN?');

                // Call the assertion callback
                done();
              });
          });
      });
  });

  it('should be able to get a list of Stores if not signed in', function (done) {
    // Create new Store model instance
    var storeObj = new Store(store);

    // Save the store
    storeObj.save(function () {
      // Request Stores
      request(app).get('/api/stores')
        .end(function (req, res) {
          // Set assertion
          res.body.should.be.instanceof(Array).and.have.lengthOf(1);

          // Call the assertion callback
          done();
        });

    });
  });

  it('should be able to get a single Store if not signed in', function (done) {
    // Create new Store model instance
    var storeObj = new Store(store);

    // Save the Store
    storeObj.save(function () {
      request(app).get('/api/stores/' + storeObj._id)
        .end(function (req, res) {
          // Set assertion
          res.body.should.be.instanceof(Object).and.have.property('name', store.name);

          // Call the assertion callback
          done();
        });
    });
  });

  it('should return proper error for single Store with an invalid Id, if not signed in', function (done) {
    // test is not a valid mongoose Id
    request(app).get('/api/stores/test')
      .end(function (req, res) {
        // Set assertion
        res.body.should.be.instanceof(Object).and.have.property('message', 'Store is invalid');

        // Call the assertion callback
        done();
      });
  });

  it('should return proper error for single Store which doesnt exist, if not signed in', function (done) {
    // This is a valid mongoose Id but a non-existent Store
    request(app).get('/api/stores/559e9cd815f80b4c256a8f41')
      .end(function (req, res) {
        // Set assertion
        res.body.should.be.instanceof(Object).and.have.property('message', 'No Store with that identifier has been found');

        // Call the assertion callback
        done();
      });
  });

  it('should be able to delete an Store if signed in', function (done) {
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

        // Save a new Store
        agent.post('/api/stores')
          .send(store)
          .expect(200)
          .end(function (storeSaveErr, storeSaveRes) {
            // Handle Store save error
            if (storeSaveErr) {
              return done(storeSaveErr);
            }

            // Delete an existing Store
            agent.delete('/api/stores/' + storeSaveRes.body._id)
              .send(store)
              .expect(200)
              .end(function (storeDeleteErr, storeDeleteRes) {
                // Handle store error error
                if (storeDeleteErr) {
                  return done(storeDeleteErr);
                }

                // Set assertions
                (storeDeleteRes.body._id).should.equal(storeSaveRes.body._id);

                // Call the assertion callback
                done();
              });
          });
      });
  });

  it('should not be able to delete an Store if not signed in', function (done) {
    // Set Store user
    store.user = user;

    // Create new Store model instance
    var storeObj = new Store(store);

    // Save the Store
    storeObj.save(function () {
      // Try deleting Store
      request(app).delete('/api/stores/' + storeObj._id)
        .expect(403)
        .end(function (storeDeleteErr, storeDeleteRes) {
          // Set message assertion
          (storeDeleteRes.body.message).should.match('User is not authorized');

          // Handle Store error error
          done(storeDeleteErr);
        });

    });
  });

  it('should be able to get a single Store that has an orphaned user reference', function (done) {
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

          // Save a new Store
          agent.post('/api/stores')
            .send(store)
            .expect(200)
            .end(function (storeSaveErr, storeSaveRes) {
              // Handle Store save error
              if (storeSaveErr) {
                return done(storeSaveErr);
              }

              // Set assertions on new Store
              (storeSaveRes.body.name).should.equal(store.name);
              should.exist(storeSaveRes.body.user);
              should.equal(storeSaveRes.body.user._id, orphanId);

              // force the Store to have an orphaned user reference
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

                    // Get the Store
                    agent.get('/api/stores/' + storeSaveRes.body._id)
                      .expect(200)
                      .end(function (storeInfoErr, storeInfoRes) {
                        // Handle Store error
                        if (storeInfoErr) {
                          return done(storeInfoErr);
                        }

                        // Set assertions
                        (storeInfoRes.body._id).should.equal(storeSaveRes.body._id);
                        (storeInfoRes.body.name).should.equal(store.name);
                        should.equal(storeInfoRes.body.user, undefined);

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
      Store.remove().exec(done);
    });
  });
});
