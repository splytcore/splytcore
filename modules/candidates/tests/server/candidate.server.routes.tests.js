'use strict'

// let should = require('should')
let request = require('supertest')
let path = require('path')
let mongoose = require('mongoose')
let User = mongoose.model('User')
let Candidate = mongoose.model('Candidate')
let express = require(path.resolve('./config/lib/express'))

/**
 * Globals
 */
let app, agent, credentials, user, candidate

/**
 * Company routes tests
 */
describe('Candidate Load testing', () => {

  before((done) => {
    // Get application
    app = express.init(mongoose)
    agent = request.agent(app)

    done()
  })

  beforeEach((done) => {
    // Create user credentials
    credentials = {
      username: 'username',
      password: 'M3@n.jsI$Aw3$0m3'
    }

    // Create a new user
    user = new User({
      firstName: 'Full',
      lastName: 'Name',
      displayName: 'Full Name',
      email: 'test@test.com',      
      password: credentials.password,
      provider: 'local'
    })

    // Save a user to the test db and create new Company
    console.log('save user')
    user.save(() => {
      done()
    })
  })

  // it('should be able to save a Candidate', (done) => {    
  //   let candidate = { lastName: 'lee', firstName: 'bruce' }
  //   agent
  //     .post('/api/candidates')
  //     .send(candidate)
  //     .expect(200)
  //     .end((err, res) => {
  //       // Handle signin error
  //       if (err) {
  //         return done(err)
  //       }
  //       done()
  //     })
  // })

  afterEach((done) => {
    User.remove().exec(() => {      
      console.log('done!')
      done()
    })
  })
})
