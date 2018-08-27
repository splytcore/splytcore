'use strict';

var should = require('should'),
  request = require('supertest'),
  path = require('path'),
  mongoose = require('mongoose'),
  User = mongoose.model('User'),
  Order = mongoose.model('Order'),
  express = require(path.resolve('./config/lib/express'));

/**
 * Globals
 */
var app,
  agent,
  credentials,
  user,
  order;

/**
 * Order routes tests
 */
describe('Order CRUD tests', function () {

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

    // Save a user to the test db and create new Order
    user.save(function () {
      order = {
        name: 'Order name'
      };

      done();
    });
  });

  it('should be able to save a Order if logged in', function (done) {
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

        // Save a new Order
        agent.post('/api/orders')
          .send(order)
          .expect(200)
          .end(function (orderSaveErr, orderSaveRes) {
            // Handle Order save error
            if (orderSaveErr) {
              return done(orderSaveErr);
            }

            // Get a list of Orders
            agent.get('/api/orders')
              .end(function (ordersGetErr, ordersGetRes) {
                // Handle Orders save error
                if (ordersGetErr) {
                  return done(ordersGetErr);
                }

                // Get Orders list
                var orders = ordersGetRes.body;

                // Set assertions
                (orders[0].user._id).should.equal(userId);
                (orders[0].name).should.match('Order name');

                // Call the assertion callback
                done();
              });
          });
      });
  });

  it('should not be able to save an Order if not logged in', function (done) {
    agent.post('/api/orders')
      .send(order)
      .expect(403)
      .end(function (orderSaveErr, orderSaveRes) {
        // Call the assertion callback
        done(orderSaveErr);
      });
  });

  it('should not be able to save an Order if no name is provided', function (done) {
    // Invalidate name field
    order.name = '';

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

        // Save a new Order
        agent.post('/api/orders')
          .send(order)
          .expect(400)
          .end(function (orderSaveErr, orderSaveRes) {
            // Set message assertion
            (orderSaveRes.body.message).should.match('Please fill Order name');

            // Handle Order save error
            done(orderSaveErr);
          });
      });
  });

  it('should be able to update an Order if signed in', function (done) {
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

        // Save a new Order
        agent.post('/api/orders')
          .send(order)
          .expect(200)
          .end(function (orderSaveErr, orderSaveRes) {
            // Handle Order save error
            if (orderSaveErr) {
              return done(orderSaveErr);
            }

            // Update Order name
            order.name = 'WHY YOU GOTTA BE SO MEAN?';

            // Update an existing Order
            agent.put('/api/orders/' + orderSaveRes.body._id)
              .send(order)
              .expect(200)
              .end(function (orderUpdateErr, orderUpdateRes) {
                // Handle Order update error
                if (orderUpdateErr) {
                  return done(orderUpdateErr);
                }

                // Set assertions
                (orderUpdateRes.body._id).should.equal(orderSaveRes.body._id);
                (orderUpdateRes.body.name).should.match('WHY YOU GOTTA BE SO MEAN?');

                // Call the assertion callback
                done();
              });
          });
      });
  });

  it('should be able to get a list of Orders if not signed in', function (done) {
    // Create new Order model instance
    var orderObj = new Order(order);

    // Save the order
    orderObj.save(function () {
      // Request Orders
      request(app).get('/api/orders')
        .end(function (req, res) {
          // Set assertion
          res.body.should.be.instanceof(Array).and.have.lengthOf(1);

          // Call the assertion callback
          done();
        });

    });
  });

  it('should be able to get a single Order if not signed in', function (done) {
    // Create new Order model instance
    var orderObj = new Order(order);

    // Save the Order
    orderObj.save(function () {
      request(app).get('/api/orders/' + orderObj._id)
        .end(function (req, res) {
          // Set assertion
          res.body.should.be.instanceof(Object).and.have.property('name', order.name);

          // Call the assertion callback
          done();
        });
    });
  });

  it('should return proper error for single Order with an invalid Id, if not signed in', function (done) {
    // test is not a valid mongoose Id
    request(app).get('/api/orders/test')
      .end(function (req, res) {
        // Set assertion
        res.body.should.be.instanceof(Object).and.have.property('message', 'Order is invalid');

        // Call the assertion callback
        done();
      });
  });

  it('should return proper error for single Order which doesnt exist, if not signed in', function (done) {
    // This is a valid mongoose Id but a non-existent Order
    request(app).get('/api/orders/559e9cd815f80b4c256a8f41')
      .end(function (req, res) {
        // Set assertion
        res.body.should.be.instanceof(Object).and.have.property('message', 'No Order with that identifier has been found');

        // Call the assertion callback
        done();
      });
  });

  it('should be able to delete an Order if signed in', function (done) {
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

        // Save a new Order
        agent.post('/api/orders')
          .send(order)
          .expect(200)
          .end(function (orderSaveErr, orderSaveRes) {
            // Handle Order save error
            if (orderSaveErr) {
              return done(orderSaveErr);
            }

            // Delete an existing Order
            agent.delete('/api/orders/' + orderSaveRes.body._id)
              .send(order)
              .expect(200)
              .end(function (orderDeleteErr, orderDeleteRes) {
                // Handle order error error
                if (orderDeleteErr) {
                  return done(orderDeleteErr);
                }

                // Set assertions
                (orderDeleteRes.body._id).should.equal(orderSaveRes.body._id);

                // Call the assertion callback
                done();
              });
          });
      });
  });

  it('should not be able to delete an Order if not signed in', function (done) {
    // Set Order user
    order.user = user;

    // Create new Order model instance
    var orderObj = new Order(order);

    // Save the Order
    orderObj.save(function () {
      // Try deleting Order
      request(app).delete('/api/orders/' + orderObj._id)
        .expect(403)
        .end(function (orderDeleteErr, orderDeleteRes) {
          // Set message assertion
          (orderDeleteRes.body.message).should.match('User is not authorized');

          // Handle Order error error
          done(orderDeleteErr);
        });

    });
  });

  it('should be able to get a single Order that has an orphaned user reference', function (done) {
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

          // Save a new Order
          agent.post('/api/orders')
            .send(order)
            .expect(200)
            .end(function (orderSaveErr, orderSaveRes) {
              // Handle Order save error
              if (orderSaveErr) {
                return done(orderSaveErr);
              }

              // Set assertions on new Order
              (orderSaveRes.body.name).should.equal(order.name);
              should.exist(orderSaveRes.body.user);
              should.equal(orderSaveRes.body.user._id, orphanId);

              // force the Order to have an orphaned user reference
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

                    // Get the Order
                    agent.get('/api/orders/' + orderSaveRes.body._id)
                      .expect(200)
                      .end(function (orderInfoErr, orderInfoRes) {
                        // Handle Order error
                        if (orderInfoErr) {
                          return done(orderInfoErr);
                        }

                        // Set assertions
                        (orderInfoRes.body._id).should.equal(orderSaveRes.body._id);
                        (orderInfoRes.body.name).should.equal(order.name);
                        should.equal(orderInfoRes.body.user, undefined);

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
      Order.remove().exec(done);
    });
  });
});
