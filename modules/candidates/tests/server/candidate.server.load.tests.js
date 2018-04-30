'use strict'

// let should = require('should')


const path = require('path')
// const express = require(path.resolve('./config/lib/express'))
const express = require('express')

const random = require('random-name')
const async = require('async')
const should = require('should')

const request = require('superagent')
const cookieParser = require('cookie-parser');
const cookie = require('cookie');

/**
 * Globals
 */
let app, agent, credentials, user, candidate, positions, cookieStr

/**
 * This module routes tests
 */
describe('Candidate Load testing', () => {


  before((done) => {

    // Sign in
    credentials = {
      email: 'skim@bernsinc.com',
      password: 'g'
    }

    let url = 'http://54.241.231.143:3000/api/auth/signin'
  
    request
      .post(url)
      .send(credentials)    
      .end((err, result) => {
        if (err) {         
          console.log(err)
          return done(err)
        }              
        let setcookie = result.headers["set-cookie"];           
        console.log('cookie to string: ' + setcookie);
        let cookies = cookie.parse(setcookie.toString() );        
        cookieStr = 'sessionId=' + cookies.sessionId
        console.log(cookieStr);  
        
        done()
      });

  })


  beforeEach((done) => {    
    done()
          
   })


  it('should be able to handle 100 list candidates requests', (done) => {    
        
    let url = 'http://54.241.231.143:3000/api/candidates'
        
    console.log(cookieStr)

    let times = 100
    let cnt = 0
    let complete = false

    let list = setInterval(() => {
      request
        .get(url)         
        .set('Cookie', [cookieStr])
        .end((err, res) => {            
          // Handle signin error        
          console.log(err ? 'list candidate error: ' + err.toString() : '')               
          cnt++
          console.log('counter: ' + cnt)
          if (cnt > times && !complete) {
            complete = true
            clearInterval(list);
            return done()
          }
        })          
    } ,1000); //1000 for every second

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
