'use strict';

var should = require('should'),
  request = require('supertest'),
  path = require('path'),
  mongoose = require('mongoose'),
  User = mongoose.model('User'),
  Category = mongoose.model('Category'),
  express = require(path.resolve('./config/lib/express'));

/**
 * Globals
 */
var app,
  agent,
  credentials,
  user,
  category;

/**
 * Category routes tests
 */
describe('Category CRUD tests', function () {

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

    // Save a user to the test db and create new Category
    user.save(function () {
      category = {
        name: 'Category name'
      };

      done();
    });
  });

  it('should be able to save a Category if logged in', function (done) {
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

        // Save a new Category
        agent.post('/api/categories')
          .send(category)
          .expect(200)
          .end(function (categorySaveErr, categorySaveRes) {
            // Handle Category save error
            if (categorySaveErr) {
              return done(categorySaveErr);
            }

            // Get a list of Categories
            agent.get('/api/categories')
              .end(function (categoriesGetErr, categoriesGetRes) {
                // Handle Categories save error
                if (categoriesGetErr) {
                  return done(categoriesGetErr);
                }

                // Get Categories list
                var categories = categoriesGetRes.body;

                // Set assertions
                (categories[0].user._id).should.equal(userId);
                (categories[0].name).should.match('Category name');

                // Call the assertion callback
                done();
              });
          });
      });
  });

  it('should not be able to save an Category if not logged in', function (done) {
    agent.post('/api/categories')
      .send(category)
      .expect(403)
      .end(function (categorySaveErr, categorySaveRes) {
        // Call the assertion callback
        done(categorySaveErr);
      });
  });

  it('should not be able to save an Category if no name is provided', function (done) {
    // Invalidate name field
    category.name = '';

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

        // Save a new Category
        agent.post('/api/categories')
          .send(category)
          .expect(400)
          .end(function (categorySaveErr, categorySaveRes) {
            // Set message assertion
            (categorySaveRes.body.message).should.match('Please fill Category name');

            // Handle Category save error
            done(categorySaveErr);
          });
      });
  });

  it('should be able to update an Category if signed in', function (done) {
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

        // Save a new Category
        agent.post('/api/categories')
          .send(category)
          .expect(200)
          .end(function (categorySaveErr, categorySaveRes) {
            // Handle Category save error
            if (categorySaveErr) {
              return done(categorySaveErr);
            }

            // Update Category name
            category.name = 'WHY YOU GOTTA BE SO MEAN?';

            // Update an existing Category
            agent.put('/api/categories/' + categorySaveRes.body._id)
              .send(category)
              .expect(200)
              .end(function (categoryUpdateErr, categoryUpdateRes) {
                // Handle Category update error
                if (categoryUpdateErr) {
                  return done(categoryUpdateErr);
                }

                // Set assertions
                (categoryUpdateRes.body._id).should.equal(categorySaveRes.body._id);
                (categoryUpdateRes.body.name).should.match('WHY YOU GOTTA BE SO MEAN?');

                // Call the assertion callback
                done();
              });
          });
      });
  });

  it('should be able to get a list of Categories if not signed in', function (done) {
    // Create new Category model instance
    var categoryObj = new Category(category);

    // Save the category
    categoryObj.save(function () {
      // Request Categories
      request(app).get('/api/categories')
        .end(function (req, res) {
          // Set assertion
          res.body.should.be.instanceof(Array).and.have.lengthOf(1);

          // Call the assertion callback
          done();
        });

    });
  });

  it('should be able to get a single Category if not signed in', function (done) {
    // Create new Category model instance
    var categoryObj = new Category(category);

    // Save the Category
    categoryObj.save(function () {
      request(app).get('/api/categories/' + categoryObj._id)
        .end(function (req, res) {
          // Set assertion
          res.body.should.be.instanceof(Object).and.have.property('name', category.name);

          // Call the assertion callback
          done();
        });
    });
  });

  it('should return proper error for single Category with an invalid Id, if not signed in', function (done) {
    // test is not a valid mongoose Id
    request(app).get('/api/categories/test')
      .end(function (req, res) {
        // Set assertion
        res.body.should.be.instanceof(Object).and.have.property('message', 'Category is invalid');

        // Call the assertion callback
        done();
      });
  });

  it('should return proper error for single Category which doesnt exist, if not signed in', function (done) {
    // This is a valid mongoose Id but a non-existent Category
    request(app).get('/api/categories/559e9cd815f80b4c256a8f41')
      .end(function (req, res) {
        // Set assertion
        res.body.should.be.instanceof(Object).and.have.property('message', 'No Category with that identifier has been found');

        // Call the assertion callback
        done();
      });
  });

  it('should be able to delete an Category if signed in', function (done) {
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

        // Save a new Category
        agent.post('/api/categories')
          .send(category)
          .expect(200)
          .end(function (categorySaveErr, categorySaveRes) {
            // Handle Category save error
            if (categorySaveErr) {
              return done(categorySaveErr);
            }

            // Delete an existing Category
            agent.delete('/api/categories/' + categorySaveRes.body._id)
              .send(category)
              .expect(200)
              .end(function (categoryDeleteErr, categoryDeleteRes) {
                // Handle category error error
                if (categoryDeleteErr) {
                  return done(categoryDeleteErr);
                }

                // Set assertions
                (categoryDeleteRes.body._id).should.equal(categorySaveRes.body._id);

                // Call the assertion callback
                done();
              });
          });
      });
  });

  it('should not be able to delete an Category if not signed in', function (done) {
    // Set Category user
    category.user = user;

    // Create new Category model instance
    var categoryObj = new Category(category);

    // Save the Category
    categoryObj.save(function () {
      // Try deleting Category
      request(app).delete('/api/categories/' + categoryObj._id)
        .expect(403)
        .end(function (categoryDeleteErr, categoryDeleteRes) {
          // Set message assertion
          (categoryDeleteRes.body.message).should.match('User is not authorized');

          // Handle Category error error
          done(categoryDeleteErr);
        });

    });
  });

  it('should be able to get a single Category that has an orphaned user reference', function (done) {
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

          // Save a new Category
          agent.post('/api/categories')
            .send(category)
            .expect(200)
            .end(function (categorySaveErr, categorySaveRes) {
              // Handle Category save error
              if (categorySaveErr) {
                return done(categorySaveErr);
              }

              // Set assertions on new Category
              (categorySaveRes.body.name).should.equal(category.name);
              should.exist(categorySaveRes.body.user);
              should.equal(categorySaveRes.body.user._id, orphanId);

              // force the Category to have an orphaned user reference
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

                    // Get the Category
                    agent.get('/api/categories/' + categorySaveRes.body._id)
                      .expect(200)
                      .end(function (categoryInfoErr, categoryInfoRes) {
                        // Handle Category error
                        if (categoryInfoErr) {
                          return done(categoryInfoErr);
                        }

                        // Set assertions
                        (categoryInfoRes.body._id).should.equal(categorySaveRes.body._id);
                        (categoryInfoRes.body.name).should.equal(category.name);
                        should.equal(categoryInfoRes.body.user, undefined);

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
      Category.remove().exec(done);
    });
  });
});
