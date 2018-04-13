'use strict'

// let should = require('should')
const request = require('supertest')
const path = require('path')
const mongoose = require('mongoose')
const Candidate = mongoose.model('Candidate')
const Position = mongoose.model('Position')
const express = require(path.resolve('./config/lib/express'))
const random = require('random-name')
const async = require('async')
const should = require('should')
/**
 * Globals
 */
let app, agent, credentials, user, candidate, positions

/**
 * Company routes tests
 */
describe('Candidate Load testing', () => {
  

  before((done) => {
    // Get application
    app = express.init(mongoose)
    agent = request.agent(app)
    Position.find().exec()
      .then((res) => {        
        positions = res
        done()    
      })    
  })


  it('should be able to register x candidates from tablet', (done) => {    
    
    let times = 100000
    let cnt = 0
    let complete = false
    
    let registration = setInterval(function register() {
      let email = Date.now() + '@fakemailfsdfds.com'
      let candidate = { 
        lastName: random.last(), 
        firstName: random.first() , 
        email: email,
        sms: '2136180615',
        position: positions[0],
        registeredFrom: 'MOBILE'
      }

      agent
        .post('/api/register/MOBILE')
        .send(candidate)
        .expect(200)
        .end((err, res) => {
          // Handle signin error        
          console.log(err ? 'create candidate error: ' + err.toString() : '')               
          cnt++
          console.log('counter: ' + cnt)
          if (cnt > times && !complete) {
            complete = true
            clearInterval(registration);
            return done()
          }
        })          
    } ,10); //1000 for every second

  })


  // afterEach((done) => {
  //   User.remove().exec(() => {      
  //     console.log('done!')
  //     done()
  //   })
  // })

  after((done) => {
    console.log('all done')
    // User.remove().exec(() => {      
    //   console.log('done!')
    done()
    // })
  })


})
