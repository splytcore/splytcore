'use strict';

var should = require('should'),
  request = require('supertest'),
  path = require('path'),
  mongoose = require('mongoose'),
  User = mongoose.model('User'),
  Seller = mongoose.model('Seller'),
  express = require(path.resolve('./config/lib/express'));

/**
 * Globals
 */
var app,
  agent,
  credentials,
  user,
  seller;

/**
 * Seller routes tests
 */
describe('Seller CRUD tests', function () {

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

    // Save a user to the test db and create new Seller
    user.save(function () {
      seller = {
        name: 'Seller name'
      };

      done();
    });
  });

  it('should be able to save a Seller if logged in', function (done) {
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

        // Save a new Seller
        agent.post('/api/sellers')
          .send(seller)
          .expect(200)
          .end(function (sellerSaveErr, sellerSaveRes) {
            // Handle Seller save error
            if (sellerSaveErr) {
              return done(sellerSaveErr);
            }

            // Get a list of Sellers
            agent.get('/api/sellers')
              .end(function (sellersGetErr, sellersGetRes) {
                // Handle Sellers save error
                if (sellersGetErr) {
                  return done(sellersGetErr);
                }

                // Get Sellers list
                var sellers = sellersGetRes.body;

                // Set assertions
                (sellers[0].user._id).should.equal(userId);
                (sellers[0].name).should.match('Seller name');

                // Call the assertion callback
                done();
              });
          });
      });
  });

  it('should not be able to save an Seller if not logged in', function (done) {
    agent.post('/api/sellers')
      .send(seller)
      .expect(403)
      .end(function (sellerSaveErr, sellerSaveRes) {
        // Call the assertion callback
        done(sellerSaveErr);
      });
  });

  it('should not be able to save an Seller if no name is provided', function (done) {
    // Invalidate name field
    seller.name = '';

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

        // Save a new Seller
        agent.post('/api/sellers')
          .send(seller)
          .expect(400)
          .end(function (sellerSaveErr, sellerSaveRes) {
            // Set message assertion
            (sellerSaveRes.body.message).should.match('Please fill Seller name');

            // Handle Seller save error
            done(sellerSaveErr);
          });
      });
  });

  it('should be able to update an Seller if signed in', function (done) {
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

        // Save a new Seller
        agent.post('/api/sellers')
          .send(seller)
          .expect(200)
          .end(function (sellerSaveErr, sellerSaveRes) {
            // Handle Seller save error
            if (sellerSaveErr) {
              return done(sellerSaveErr);
            }

            // Update Seller name
            seller.name = 'WHY YOU GOTTA BE SO MEAN?';

            // Update an existing Seller
            agent.put('/api/sellers/' + sellerSaveRes.body._id)
              .send(seller)
              .expect(200)
              .end(function (sellerUpdateErr, sellerUpdateRes) {
                // Handle Seller update error
                if (sellerUpdateErr) {
                  return done(sellerUpdateErr);
                }

                // Set assertions
                (sellerUpdateRes.body._id).should.equal(sellerSaveRes.body._id);
                (sellerUpdateRes.body.name).should.match('WHY YOU GOTTA BE SO MEAN?');

                // Call the assertion callback
                done();
              });
          });
      });
  });

  it('should be able to get a list of Sellers if not signed in', function (done) {
    // Create new Seller model instance
    var sellerObj = new Seller(seller);

    // Save the seller
    sellerObj.save(function () {
      // Request Sellers
      request(app).get('/api/sellers')
        .end(function (req, res) {
          // Set assertion
          res.body.should.be.instanceof(Array).and.have.lengthOf(1);

          // Call the assertion callback
          done();
        });

    });
  });

  it('should be able to get a single Seller if not signed in', function (done) {
    // Create new Seller model instance
    var sellerObj = new Seller(seller);

    // Save the Seller
    sellerObj.save(function () {
      request(app).get('/api/sellers/' + sellerObj._id)
        .end(function (req, res) {
          // Set assertion
          res.body.should.be.instanceof(Object).and.have.property('name', seller.name);

          // Call the assertion callback
          done();
        });
    });
  });

  it('should return proper error for single Seller with an invalid Id, if not signed in', function (done) {
    // test is not a valid mongoose Id
    request(app).get('/api/sellers/test')
      .end(function (req, res) {
        // Set assertion
        res.body.should.be.instanceof(Object).and.have.property('message', 'Seller is invalid');

        // Call the assertion callback
        done();
      });
  });

  it('should return proper error for single Seller which doesnt exist, if not signed in', function (done) {
    // This is a valid mongoose Id but a non-existent Seller
    request(app).get('/api/sellers/559e9cd815f80b4c256a8f41')
      .end(function (req, res) {
        // Set assertion
        res.body.should.be.instanceof(Object).and.have.property('message', 'No Seller with that identifier has been found');

        // Call the assertion callback
        done();
      });
  });

  it('should be able to delete an Seller if signed in', function (done) {
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

        // Save a new Seller
        agent.post('/api/sellers')
          .send(seller)
          .expect(200)
          .end(function (sellerSaveErr, sellerSaveRes) {
            // Handle Seller save error
            if (sellerSaveErr) {
              return done(sellerSaveErr);
            }

            // Delete an existing Seller
            agent.delete('/api/sellers/' + sellerSaveRes.body._id)
              .send(seller)
              .expect(200)
              .end(function (sellerDeleteErr, sellerDeleteRes) {
                // Handle seller error error
                if (sellerDeleteErr) {
                  return done(sellerDeleteErr);
                }

                // Set assertions
                (sellerDeleteRes.body._id).should.equal(sellerSaveRes.body._id);

                // Call the assertion callback
                done();
              });
          });
      });
  });

  it('should not be able to delete an Seller if not signed in', function (done) {
    // Set Seller user
    seller.user = user;

    // Create new Seller model instance
    var sellerObj = new Seller(seller);

    // Save the Seller
    sellerObj.save(function () {
      // Try deleting Seller
      request(app).delete('/api/sellers/' + sellerObj._id)
        .expect(403)
        .end(function (sellerDeleteErr, sellerDeleteRes) {
          // Set message assertion
          (sellerDeleteRes.body.message).should.match('User is not authorized');

          // Handle Seller error error
          done(sellerDeleteErr);
        });

    });
  });

  it('should be able to get a single Seller that has an orphaned user reference', function (done) {
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

          // Save a new Seller
          agent.post('/api/sellers')
            .send(seller)
            .expect(200)
            .end(function (sellerSaveErr, sellerSaveRes) {
              // Handle Seller save error
              if (sellerSaveErr) {
                return done(sellerSaveErr);
              }

              // Set assertions on new Seller
              (sellerSaveRes.body.name).should.equal(seller.name);
              should.exist(sellerSaveRes.body.user);
              should.equal(sellerSaveRes.body.user._id, orphanId);

              // force the Seller to have an orphaned user reference
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

                    // Get the Seller
                    agent.get('/api/sellers/' + sellerSaveRes.body._id)
                      .expect(200)
                      .end(function (sellerInfoErr, sellerInfoRes) {
                        // Handle Seller error
                        if (sellerInfoErr) {
                          return done(sellerInfoErr);
                        }

                        // Set assertions
                        (sellerInfoRes.body._id).should.equal(sellerSaveRes.body._id);
                        (sellerInfoRes.body.name).should.equal(seller.name);
                        should.equal(sellerInfoRes.body.user, undefined);

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
      Seller.remove().exec(done);
    });
  });
});
