'use strict'

const request = require('supertest')      
const path = require('path')
const mongoose = require('mongoose')

const Candidate = mongoose.model('Candidate')
const Position = mongoose.model('Position')
const express = require(path.resolve('./config/lib/express'))
const random = require('random-name')
const async = require('async')
const should = require('should')

const cookie = require('cookie');

/**
 * Globals
 */
let app, agent, credentials, user, candidate, positions, cookieStr

const email1 = Date.now() + '@fakemailfsdfds.com'
const email2 = Date.now() + '@faksfsdemailfsdfds.com'

/**
 * Company routes tests
 */
describe('Candidate Routes Testing', () => {
  
  before((done) => {
    // Get application
    app = express.init(mongoose)
    agent = request.agent(app)
    Position.find().exec()
      .then((res) => {        
        positions = res        
      })    

    // Sign in
    credentials = {
      email: 'skim@bernsinc.com',
      password: 'g'
    }
    
    agent
      .post('/api/auth/signin')
      .send(credentials)    
      .end((err, result) => {
        if (err) {        
          console.log('error signin in') 
          console.log(err)
          return done(err)
        }              
        let setcookie = result.headers["set-cookie"]           
        console.log('cookie to string: ' + setcookie)
        let cookies = cookie.parse(setcookie.toString()) 
        cookieStr = 'sessionId=' + cookies.sessionId
        console.log(cookieStr)          
        done()
      })      
  })


  it('should be able to register candidate for position 1 from mobile', (done) => {        

    let candidate = { 
      lastName: random.last(), 
      firstName: random.first() , 
      email: email1,
      sms: '2136180615',
      position: positions[1]
    }

    agent
      .post('/api/register/MOBILE')
      .send(candidate)
      .expect(200)
      .end((err, res) => {
        if (err) {
          console.log('create candidate error: ' + err.toString())               
          return done(err)
        }          
        return done()
      })          
  })
  
  it('should be able to register candidate for position from web', (done) => {    
    
    let candidate = { 
      lastName: random.last(), 
      firstName: random.first() , 
      email: email2,
      sms: '2136180615',
      position: positions[2]     
    }
    agent
      .post('/api/register/WEB')
      .send(candidate)
      .expect(200)
      .end((err, res) => {
        if (err) {
          console.log('create candidate error: ' + err.toString())               
          return done(err)
        }          
        return done()
      })          

  })

  it('should be able to check in candidate who registered from web from web', (done) => {        

    new Promise((resolve, reject) => {  
      agent        
        .get('/api/candidateByEmail/' + email2)
        .expect(200)
        .end((err, result) => {
          if (err) {
            console.log('create candidate error: ' + err.toString())               
            reject(err)            
          }                  
          resolve(result.body)
        })          
    })
    .then((candidate) => {
      console.log(candidate.email)
      agent        
        .post('/api/checkin')
        .send({ email: candidate.email })
        .expect(200)
        .end((err, result) => {
          if (err) {
            console.log('create candidate error: ' + err.toString())               
            return done(err)            
          }                  
          return done()
        })                
    })    
    .catch((err) => {
      return done(err)
    })

  })


  it('should be able update candidate to interview with department', (done) => {        

    new Promise((resolve, reject) => {  
      agent        
        .get('/api/candidateByEmail/' + email1)
        .expect(200)
        .end((err, result) => {
          if (err) {
            reject(err)            
          }                  
          resolve(result.body)
        })          
    })
    .then((candidate) => {      
      agent        
        .put('/api/candidates/' +  candidate._id)
        .send({ stage: 'INTERVIEW' })
        .set('Cookie', [cookieStr])
        .expect(200)
        .end((err, result) => {
          if (err) {            
            return done(err)            
          }                  
          return done()
        })                
    })    
    .catch((err) => {
      return done(err)
    })

  })


  it('should be able update candidate to interview with department', (done) => {        

    new Promise((resolve, reject) => {  
      agent        
        .get('/api/candidateByEmail/' + email1)
        .expect(200)
        .end((err, result) => {
          if (err) {
            reject(err)            
          }                  
          resolve(result.body)
        })          
    })
    .then((candidate) => {      
      agent        
        .put('/api/candidates/' +  candidate._id)
        .send({ stage: 'VALUATED' })
        .set('Cookie', [cookieStr])
        .expect(200)
        .end((err, result) => {
          if (err) {            
            return done(err)            
          }                  
          return done()
        })                
    })    
    .catch((err) => {
      return done(err)
    })

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
