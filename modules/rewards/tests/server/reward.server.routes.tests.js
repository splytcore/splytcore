'use strict';

var should = require('should'),
  request = require('supertest'),
  path = require('path'),
  mongoose = require('mongoose'),
  User = mongoose.model('User'),
  Reward = mongoose.model('Reward'),
  express = require(path.resolve('./config/lib/express'));

/**
 * Globals
 */
var app,
  agent,
  credentials,
  user,
  reward;

/**
 * Reward routes tests
 */
describe('Reward CRUD tests', function () {

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

    // Save a user to the test db and create new Reward
    user.save(function () {
      reward = {
        name: 'Reward name'
      };

      done();
    });
  });

  it('should be able to save a Reward if logged in', function (done) {
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

        // Save a new Reward
        agent.post('/api/rewards')
          .send(reward)
          .expect(200)
          .end(function (rewardSaveErr, rewardSaveRes) {
            // Handle Reward save error
            if (rewardSaveErr) {
              return done(rewardSaveErr);
            }

            // Get a list of Rewards
            agent.get('/api/rewards')
              .end(function (rewardsGetErr, rewardsGetRes) {
                // Handle Rewards save error
                if (rewardsGetErr) {
                  return done(rewardsGetErr);
                }

                // Get Rewards list
                var rewards = rewardsGetRes.body;

                // Set assertions
                (rewards[0].user._id).should.equal(userId);
                (rewards[0].name).should.match('Reward name');

                // Call the assertion callback
                done();
              });
          });
      });
  });

  it('should not be able to save an Reward if not logged in', function (done) {
    agent.post('/api/rewards')
      .send(reward)
      .expect(403)
      .end(function (rewardSaveErr, rewardSaveRes) {
        // Call the assertion callback
        done(rewardSaveErr);
      });
  });

  it('should not be able to save an Reward if no name is provided', function (done) {
    // Invalidate name field
    reward.name = '';

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

        // Save a new Reward
        agent.post('/api/rewards')
          .send(reward)
          .expect(400)
          .end(function (rewardSaveErr, rewardSaveRes) {
            // Set message assertion
            (rewardSaveRes.body.message).should.match('Please fill Reward name');

            // Handle Reward save error
            done(rewardSaveErr);
          });
      });
  });

  it('should be able to update an Reward if signed in', function (done) {
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

        // Save a new Reward
        agent.post('/api/rewards')
          .send(reward)
          .expect(200)
          .end(function (rewardSaveErr, rewardSaveRes) {
            // Handle Reward save error
            if (rewardSaveErr) {
              return done(rewardSaveErr);
            }

            // Update Reward name
            reward.name = 'WHY YOU GOTTA BE SO MEAN?';

            // Update an existing Reward
            agent.put('/api/rewards/' + rewardSaveRes.body._id)
              .send(reward)
              .expect(200)
              .end(function (rewardUpdateErr, rewardUpdateRes) {
                // Handle Reward update error
                if (rewardUpdateErr) {
                  return done(rewardUpdateErr);
                }

                // Set assertions
                (rewardUpdateRes.body._id).should.equal(rewardSaveRes.body._id);
                (rewardUpdateRes.body.name).should.match('WHY YOU GOTTA BE SO MEAN?');

                // Call the assertion callback
                done();
              });
          });
      });
  });

  it('should be able to get a list of Rewards if not signed in', function (done) {
    // Create new Reward model instance
    var rewardObj = new Reward(reward);

    // Save the reward
    rewardObj.save(function () {
      // Request Rewards
      request(app).get('/api/rewards')
        .end(function (req, res) {
          // Set assertion
          res.body.should.be.instanceof(Array).and.have.lengthOf(1);

          // Call the assertion callback
          done();
        });

    });
  });

  it('should be able to get a single Reward if not signed in', function (done) {
    // Create new Reward model instance
    var rewardObj = new Reward(reward);

    // Save the Reward
    rewardObj.save(function () {
      request(app).get('/api/rewards/' + rewardObj._id)
        .end(function (req, res) {
          // Set assertion
          res.body.should.be.instanceof(Object).and.have.property('name', reward.name);

          // Call the assertion callback
          done();
        });
    });
  });

  it('should return proper error for single Reward with an invalid Id, if not signed in', function (done) {
    // test is not a valid mongoose Id
    request(app).get('/api/rewards/test')
      .end(function (req, res) {
        // Set assertion
        res.body.should.be.instanceof(Object).and.have.property('message', 'Reward is invalid');

        // Call the assertion callback
        done();
      });
  });

  it('should return proper error for single Reward which doesnt exist, if not signed in', function (done) {
    // This is a valid mongoose Id but a non-existent Reward
    request(app).get('/api/rewards/559e9cd815f80b4c256a8f41')
      .end(function (req, res) {
        // Set assertion
        res.body.should.be.instanceof(Object).and.have.property('message', 'No Reward with that identifier has been found');

        // Call the assertion callback
        done();
      });
  });

  it('should be able to delete an Reward if signed in', function (done) {
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

        // Save a new Reward
        agent.post('/api/rewards')
          .send(reward)
          .expect(200)
          .end(function (rewardSaveErr, rewardSaveRes) {
            // Handle Reward save error
            if (rewardSaveErr) {
              return done(rewardSaveErr);
            }

            // Delete an existing Reward
            agent.delete('/api/rewards/' + rewardSaveRes.body._id)
              .send(reward)
              .expect(200)
              .end(function (rewardDeleteErr, rewardDeleteRes) {
                // Handle reward error error
                if (rewardDeleteErr) {
                  return done(rewardDeleteErr);
                }

                // Set assertions
                (rewardDeleteRes.body._id).should.equal(rewardSaveRes.body._id);

                // Call the assertion callback
                done();
              });
          });
      });
  });

  it('should not be able to delete an Reward if not signed in', function (done) {
    // Set Reward user
    reward.user = user;

    // Create new Reward model instance
    var rewardObj = new Reward(reward);

    // Save the Reward
    rewardObj.save(function () {
      // Try deleting Reward
      request(app).delete('/api/rewards/' + rewardObj._id)
        .expect(403)
        .end(function (rewardDeleteErr, rewardDeleteRes) {
          // Set message assertion
          (rewardDeleteRes.body.message).should.match('User is not authorized');

          // Handle Reward error error
          done(rewardDeleteErr);
        });

    });
  });

  it('should be able to get a single Reward that has an orphaned user reference', function (done) {
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

          // Save a new Reward
          agent.post('/api/rewards')
            .send(reward)
            .expect(200)
            .end(function (rewardSaveErr, rewardSaveRes) {
              // Handle Reward save error
              if (rewardSaveErr) {
                return done(rewardSaveErr);
              }

              // Set assertions on new Reward
              (rewardSaveRes.body.name).should.equal(reward.name);
              should.exist(rewardSaveRes.body.user);
              should.equal(rewardSaveRes.body.user._id, orphanId);

              // force the Reward to have an orphaned user reference
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

                    // Get the Reward
                    agent.get('/api/rewards/' + rewardSaveRes.body._id)
                      .expect(200)
                      .end(function (rewardInfoErr, rewardInfoRes) {
                        // Handle Reward error
                        if (rewardInfoErr) {
                          return done(rewardInfoErr);
                        }

                        // Set assertions
                        (rewardInfoRes.body._id).should.equal(rewardSaveRes.body._id);
                        (rewardInfoRes.body.name).should.equal(reward.name);
                        should.equal(rewardInfoRes.body.user, undefined);

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
      Reward.remove().exec(done);
    });
  });
});
