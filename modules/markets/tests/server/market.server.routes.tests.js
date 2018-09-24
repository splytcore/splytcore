'use strict';

var should = require('should'),
  request = require('supertest'),
  path = require('path'),
  mongoose = require('mongoose'),
  User = mongoose.model('User'),
  Market = mongoose.model('Market'),
  express = require(path.resolve('./config/lib/express'));

/**
 * Globals
 */
var app,
  agent,
  credentials,
  user,
  market;

/**
 * Market routes tests
 */
describe('Market CRUD tests', function () {

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

    // Save a user to the test db and create new Market
    user.save(function () {
      market = {
        name: 'Market name'
      };

      done();
    });
  });

  it('should be able to save a Market if logged in', function (done) {
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

        // Save a new Market
        agent.post('/api/markets')
          .send(market)
          .expect(200)
          .end(function (marketSaveErr, marketSaveRes) {
            // Handle Market save error
            if (marketSaveErr) {
              return done(marketSaveErr);
            }

            // Get a list of Markets
            agent.get('/api/markets')
              .end(function (marketsGetErr, marketsGetRes) {
                // Handle Markets save error
                if (marketsGetErr) {
                  return done(marketsGetErr);
                }

                // Get Markets list
                var markets = marketsGetRes.body;

                // Set assertions
                (markets[0].user._id).should.equal(userId);
                (markets[0].name).should.match('Market name');

                // Call the assertion callback
                done();
              });
          });
      });
  });

  it('should not be able to save an Market if not logged in', function (done) {
    agent.post('/api/markets')
      .send(market)
      .expect(403)
      .end(function (marketSaveErr, marketSaveRes) {
        // Call the assertion callback
        done(marketSaveErr);
      });
  });

  it('should not be able to save an Market if no name is provided', function (done) {
    // Invalidate name field
    market.name = '';

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

        // Save a new Market
        agent.post('/api/markets')
          .send(market)
          .expect(400)
          .end(function (marketSaveErr, marketSaveRes) {
            // Set message assertion
            (marketSaveRes.body.message).should.match('Please fill Market name');

            // Handle Market save error
            done(marketSaveErr);
          });
      });
  });

  it('should be able to update an Market if signed in', function (done) {
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

        // Save a new Market
        agent.post('/api/markets')
          .send(market)
          .expect(200)
          .end(function (marketSaveErr, marketSaveRes) {
            // Handle Market save error
            if (marketSaveErr) {
              return done(marketSaveErr);
            }

            // Update Market name
            market.name = 'WHY YOU GOTTA BE SO MEAN?';

            // Update an existing Market
            agent.put('/api/markets/' + marketSaveRes.body._id)
              .send(market)
              .expect(200)
              .end(function (marketUpdateErr, marketUpdateRes) {
                // Handle Market update error
                if (marketUpdateErr) {
                  return done(marketUpdateErr);
                }

                // Set assertions
                (marketUpdateRes.body._id).should.equal(marketSaveRes.body._id);
                (marketUpdateRes.body.name).should.match('WHY YOU GOTTA BE SO MEAN?');

                // Call the assertion callback
                done();
              });
          });
      });
  });

  it('should be able to get a list of Markets if not signed in', function (done) {
    // Create new Market model instance
    var marketObj = new Market(market);

    // Save the market
    marketObj.save(function () {
      // Request Markets
      request(app).get('/api/markets')
        .end(function (req, res) {
          // Set assertion
          res.body.should.be.instanceof(Array).and.have.lengthOf(1);

          // Call the assertion callback
          done();
        });

    });
  });

  it('should be able to get a single Market if not signed in', function (done) {
    // Create new Market model instance
    var marketObj = new Market(market);

    // Save the Market
    marketObj.save(function () {
      request(app).get('/api/markets/' + marketObj._id)
        .end(function (req, res) {
          // Set assertion
          res.body.should.be.instanceof(Object).and.have.property('name', market.name);

          // Call the assertion callback
          done();
        });
    });
  });

  it('should return proper error for single Market with an invalid Id, if not signed in', function (done) {
    // test is not a valid mongoose Id
    request(app).get('/api/markets/test')
      .end(function (req, res) {
        // Set assertion
        res.body.should.be.instanceof(Object).and.have.property('message', 'Market is invalid');

        // Call the assertion callback
        done();
      });
  });

  it('should return proper error for single Market which doesnt exist, if not signed in', function (done) {
    // This is a valid mongoose Id but a non-existent Market
    request(app).get('/api/markets/559e9cd815f80b4c256a8f41')
      .end(function (req, res) {
        // Set assertion
        res.body.should.be.instanceof(Object).and.have.property('message', 'No Market with that identifier has been found');

        // Call the assertion callback
        done();
      });
  });

  it('should be able to delete an Market if signed in', function (done) {
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

        // Save a new Market
        agent.post('/api/markets')
          .send(market)
          .expect(200)
          .end(function (marketSaveErr, marketSaveRes) {
            // Handle Market save error
            if (marketSaveErr) {
              return done(marketSaveErr);
            }

            // Delete an existing Market
            agent.delete('/api/markets/' + marketSaveRes.body._id)
              .send(market)
              .expect(200)
              .end(function (marketDeleteErr, marketDeleteRes) {
                // Handle market error error
                if (marketDeleteErr) {
                  return done(marketDeleteErr);
                }

                // Set assertions
                (marketDeleteRes.body._id).should.equal(marketSaveRes.body._id);

                // Call the assertion callback
                done();
              });
          });
      });
  });

  it('should not be able to delete an Market if not signed in', function (done) {
    // Set Market user
    market.user = user;

    // Create new Market model instance
    var marketObj = new Market(market);

    // Save the Market
    marketObj.save(function () {
      // Try deleting Market
      request(app).delete('/api/markets/' + marketObj._id)
        .expect(403)
        .end(function (marketDeleteErr, marketDeleteRes) {
          // Set message assertion
          (marketDeleteRes.body.message).should.match('User is not authorized');

          // Handle Market error error
          done(marketDeleteErr);
        });

    });
  });

  it('should be able to get a single Market that has an orphaned user reference', function (done) {
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

          // Save a new Market
          agent.post('/api/markets')
            .send(market)
            .expect(200)
            .end(function (marketSaveErr, marketSaveRes) {
              // Handle Market save error
              if (marketSaveErr) {
                return done(marketSaveErr);
              }

              // Set assertions on new Market
              (marketSaveRes.body.name).should.equal(market.name);
              should.exist(marketSaveRes.body.user);
              should.equal(marketSaveRes.body.user._id, orphanId);

              // force the Market to have an orphaned user reference
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

                    // Get the Market
                    agent.get('/api/markets/' + marketSaveRes.body._id)
                      .expect(200)
                      .end(function (marketInfoErr, marketInfoRes) {
                        // Handle Market error
                        if (marketInfoErr) {
                          return done(marketInfoErr);
                        }

                        // Set assertions
                        (marketInfoRes.body._id).should.equal(marketSaveRes.body._id);
                        (marketInfoRes.body.name).should.equal(market.name);
                        should.equal(marketInfoRes.body.user, undefined);

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
      Market.remove().exec(done);
    });
  });
});
