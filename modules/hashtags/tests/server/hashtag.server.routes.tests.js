'use strict';

var should = require('should'),
  request = require('supertest'),
  path = require('path'),
  mongoose = require('mongoose'),
  User = mongoose.model('User'),
  Hashtag = mongoose.model('Hashtag'),
  express = require(path.resolve('./config/lib/express'));

/**
 * Globals
 */
var app,
  agent,
  credentials,
  user,
  hashtag;

/**
 * Hashtag routes tests
 */
describe('Hashtag CRUD tests', function () {

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

    // Save a user to the test db and create new Hashtag
    user.save(function () {
      hashtag = {
        name: 'Hashtag name'
      };

      done();
    });
  });

  it('should be able to save a Hashtag if logged in', function (done) {
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

        // Save a new Hashtag
        agent.post('/api/hashtags')
          .send(hashtag)
          .expect(200)
          .end(function (hashtagSaveErr, hashtagSaveRes) {
            // Handle Hashtag save error
            if (hashtagSaveErr) {
              return done(hashtagSaveErr);
            }

            // Get a list of Hashtags
            agent.get('/api/hashtags')
              .end(function (hashtagsGetErr, hashtagsGetRes) {
                // Handle Hashtags save error
                if (hashtagsGetErr) {
                  return done(hashtagsGetErr);
                }

                // Get Hashtags list
                var hashtags = hashtagsGetRes.body;

                // Set assertions
                (hashtags[0].user._id).should.equal(userId);
                (hashtags[0].name).should.match('Hashtag name');

                // Call the assertion callback
                done();
              });
          });
      });
  });

  it('should not be able to save an Hashtag if not logged in', function (done) {
    agent.post('/api/hashtags')
      .send(hashtag)
      .expect(403)
      .end(function (hashtagSaveErr, hashtagSaveRes) {
        // Call the assertion callback
        done(hashtagSaveErr);
      });
  });

  it('should not be able to save an Hashtag if no name is provided', function (done) {
    // Invalidate name field
    hashtag.name = '';

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

        // Save a new Hashtag
        agent.post('/api/hashtags')
          .send(hashtag)
          .expect(400)
          .end(function (hashtagSaveErr, hashtagSaveRes) {
            // Set message assertion
            (hashtagSaveRes.body.message).should.match('Please fill Hashtag name');

            // Handle Hashtag save error
            done(hashtagSaveErr);
          });
      });
  });

  it('should be able to update an Hashtag if signed in', function (done) {
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

        // Save a new Hashtag
        agent.post('/api/hashtags')
          .send(hashtag)
          .expect(200)
          .end(function (hashtagSaveErr, hashtagSaveRes) {
            // Handle Hashtag save error
            if (hashtagSaveErr) {
              return done(hashtagSaveErr);
            }

            // Update Hashtag name
            hashtag.name = 'WHY YOU GOTTA BE SO MEAN?';

            // Update an existing Hashtag
            agent.put('/api/hashtags/' + hashtagSaveRes.body._id)
              .send(hashtag)
              .expect(200)
              .end(function (hashtagUpdateErr, hashtagUpdateRes) {
                // Handle Hashtag update error
                if (hashtagUpdateErr) {
                  return done(hashtagUpdateErr);
                }

                // Set assertions
                (hashtagUpdateRes.body._id).should.equal(hashtagSaveRes.body._id);
                (hashtagUpdateRes.body.name).should.match('WHY YOU GOTTA BE SO MEAN?');

                // Call the assertion callback
                done();
              });
          });
      });
  });

  it('should be able to get a list of Hashtags if not signed in', function (done) {
    // Create new Hashtag model instance
    var hashtagObj = new Hashtag(hashtag);

    // Save the hashtag
    hashtagObj.save(function () {
      // Request Hashtags
      request(app).get('/api/hashtags')
        .end(function (req, res) {
          // Set assertion
          res.body.should.be.instanceof(Array).and.have.lengthOf(1);

          // Call the assertion callback
          done();
        });

    });
  });

  it('should be able to get a single Hashtag if not signed in', function (done) {
    // Create new Hashtag model instance
    var hashtagObj = new Hashtag(hashtag);

    // Save the Hashtag
    hashtagObj.save(function () {
      request(app).get('/api/hashtags/' + hashtagObj._id)
        .end(function (req, res) {
          // Set assertion
          res.body.should.be.instanceof(Object).and.have.property('name', hashtag.name);

          // Call the assertion callback
          done();
        });
    });
  });

  it('should return proper error for single Hashtag with an invalid Id, if not signed in', function (done) {
    // test is not a valid mongoose Id
    request(app).get('/api/hashtags/test')
      .end(function (req, res) {
        // Set assertion
        res.body.should.be.instanceof(Object).and.have.property('message', 'Hashtag is invalid');

        // Call the assertion callback
        done();
      });
  });

  it('should return proper error for single Hashtag which doesnt exist, if not signed in', function (done) {
    // This is a valid mongoose Id but a non-existent Hashtag
    request(app).get('/api/hashtags/559e9cd815f80b4c256a8f41')
      .end(function (req, res) {
        // Set assertion
        res.body.should.be.instanceof(Object).and.have.property('message', 'No Hashtag with that identifier has been found');

        // Call the assertion callback
        done();
      });
  });

  it('should be able to delete an Hashtag if signed in', function (done) {
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

        // Save a new Hashtag
        agent.post('/api/hashtags')
          .send(hashtag)
          .expect(200)
          .end(function (hashtagSaveErr, hashtagSaveRes) {
            // Handle Hashtag save error
            if (hashtagSaveErr) {
              return done(hashtagSaveErr);
            }

            // Delete an existing Hashtag
            agent.delete('/api/hashtags/' + hashtagSaveRes.body._id)
              .send(hashtag)
              .expect(200)
              .end(function (hashtagDeleteErr, hashtagDeleteRes) {
                // Handle hashtag error error
                if (hashtagDeleteErr) {
                  return done(hashtagDeleteErr);
                }

                // Set assertions
                (hashtagDeleteRes.body._id).should.equal(hashtagSaveRes.body._id);

                // Call the assertion callback
                done();
              });
          });
      });
  });

  it('should not be able to delete an Hashtag if not signed in', function (done) {
    // Set Hashtag user
    hashtag.user = user;

    // Create new Hashtag model instance
    var hashtagObj = new Hashtag(hashtag);

    // Save the Hashtag
    hashtagObj.save(function () {
      // Try deleting Hashtag
      request(app).delete('/api/hashtags/' + hashtagObj._id)
        .expect(403)
        .end(function (hashtagDeleteErr, hashtagDeleteRes) {
          // Set message assertion
          (hashtagDeleteRes.body.message).should.match('User is not authorized');

          // Handle Hashtag error error
          done(hashtagDeleteErr);
        });

    });
  });

  it('should be able to get a single Hashtag that has an orphaned user reference', function (done) {
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

          // Save a new Hashtag
          agent.post('/api/hashtags')
            .send(hashtag)
            .expect(200)
            .end(function (hashtagSaveErr, hashtagSaveRes) {
              // Handle Hashtag save error
              if (hashtagSaveErr) {
                return done(hashtagSaveErr);
              }

              // Set assertions on new Hashtag
              (hashtagSaveRes.body.name).should.equal(hashtag.name);
              should.exist(hashtagSaveRes.body.user);
              should.equal(hashtagSaveRes.body.user._id, orphanId);

              // force the Hashtag to have an orphaned user reference
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

                    // Get the Hashtag
                    agent.get('/api/hashtags/' + hashtagSaveRes.body._id)
                      .expect(200)
                      .end(function (hashtagInfoErr, hashtagInfoRes) {
                        // Handle Hashtag error
                        if (hashtagInfoErr) {
                          return done(hashtagInfoErr);
                        }

                        // Set assertions
                        (hashtagInfoRes.body._id).should.equal(hashtagSaveRes.body._id);
                        (hashtagInfoRes.body.name).should.equal(hashtag.name);
                        should.equal(hashtagInfoRes.body.user, undefined);

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
      Hashtag.remove().exec(done);
    });
  });
});
