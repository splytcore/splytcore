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
let app, 
    agent, 
    credentials, 
    user, 
    candidate, 
    positions, 
    cookieStr, 
    // baseURL = 'http://54.241.231.143:3000/'               
    baseURL = 'http://10.0.1.65:3000/'

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

  
    // request
    //   .post(baseURL + 'api/auth/signin')
    //   .send(credentials)    
    //   .end((err, result) => {
    //     if (err) {         
    //       console.log(err)
    //       return done(err)
    //     }              
    //     let setcookie = result.headers["set-cookie"]           
    //     console.log('cookie to string: ' + setcookie)
    //     let cookies = cookie.parse(setcookie.toString()) 
    //     cookieStr = 'sessionId=' + cookies.sessionId
    //     console.log(cookieStr)          
    //   })
    
    let url = baseURL + 'api/positions'

    console.log(url)    
    request
      .get(url)
      .end((err, result) => {
        if (err) {         
          console.log(err)
          return done(err)
        }                      
        console.log(result.body)
        console.log('positions length ' + result.body.length)
        positions = result.body                
        done()
      })

  })


  beforeEach((done) => {    
    done()
          
   })


  it('should be able to create 1000 registrations', (done) => {    
  
    let times = 1000
    let cnt = 0
    let complete = false

    let registration = setInterval(function register() {
      let email = Date.now() + '@fakemailfsdfds.com'
      let candidate = { 
        lastName: random.last(), 
        firstName: random.first() , 
        email: email,
        sms: '2136180615',
        position: positions[2],
        registeredFrom: 'WEB'
      }      
      request
        .post(baseURL + 'api/register/WEB')
        .send(candidate)
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
    } ,1000); //1000 for every second


  })


  // it('should be able to handle 100 list candidates requests', (done) => {    
        
  //   let url = 'http://54.241.231.143:3000/api/candidates'
        
  //   console.log(cookieStr)

  //   let times = 100
  //   let cnt = 0

  //   let list = setInterval(() => {
  //     request
  //       .get(url)         
  //       .set('Cookie', [cookieStr])
  //       .end((err, res) => {            
  //         // Handle signin error        
  //         console.log(err ? 'list candidate error: ' + err.toString() : '')               
  //         cnt++
  //         console.log('counter: ' + cnt)
  //         if (cnt > times) {            
  //           clearInterval(list);
  //           return done()
  //         }
  //       })          
  //   } ,1000); //1000 for every second

  // })

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
