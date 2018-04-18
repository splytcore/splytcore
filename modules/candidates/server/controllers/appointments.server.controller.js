'use strict';

/**
 * Module dependencies.
 */
const path = require('path')
const mongoose = require('mongoose')

mongoose.Promise = require('bluebird')

const async = require('async')
const Candidate = mongoose.model('Candidate')  
const Appointment = mongoose.model('Appointment')  
const Department = mongoose.model('Department')  

const errorHandler = require(path.resolve('./modules/core/server/controllers/errors.server.controller'))
const _ = require('lodash')

const config = require(path.resolve('./config/config'))
const nodemailer = require('nodemailer')
const crypto = require('crypto')
const smtpTransport = nodemailer.createTransport(config.mailer.options)

const twilio = require('twilio')
const client = new twilio(config.twilio.SID, config.twilio.authToken)
const twilioClient = twilio(config.twilio.SID, config.twilio.authToken).lookups.v1


//@desc creates a schedule in x increments from now
exports.setAppointment = function(candidate) {

  return new Promise((resolve, reject) => {
    async.waterfall([
      function getNextAppointment(next) {        
        getNextAppointmentFormula(candidate, (err, openAppt) => {
          next(err, openAppt)
        })  
      },
      function saveNextAppointment(openAppt, next) {        
        //update appointment with candidate
        openAppt.candidate = candidate                
        openAppt.save((err) => {
          next(err, openAppt)
        })        
      },      
      function sendSMSAppointment(appt, next) {  
        let apptString = (new Date(appt.appointment)).toLocaleTimeString([], { hour: '2-digit', minute:'2-digit', hour12 : true })
        console.log(apptString)
        let message = `Blockahins: WE LIKA LIKA LIKA YOU ALOT! Please go to the ${candidate.department.display} department at ${apptString}`
        client.messages.create({
          body: message,
          to: '+1' + candidate.sms,  // Text this number
          from: config.twilio.from // From a valid Twilio number
        })
        .then((message) => {          
          candidate.appointment = appt.appointment //this is temp. only used for emiting correct appointment.
          global.emitInterviewCandidate ? global.emitInterviewCandidate(candidate) : null  // jshint ignore:line
          console.log('message for successful passing: ' + message)    
          next(null, appt)
        })
        .catch((err) => {
          console.log('sms error')
          console.log(err)
          next(err)
        })
      }
    ], (err, appt) => {
      if (err) {
        reject(err)
      } else {      
        resolve(appt)
      }
    })
  })
}


//TODO: formula
function getNextAppointmentFormula(candidate, cb) {

  console.log('next appoint for dept: ' + candidate.department.name)

  Appointment.findOne({ department: candidate.department, candidate: { $eq :null }}).sort('appointment').exec((err, openAppt) => {
    console.log('earliest open appt: ')
    console.log(openAppt)    
    cb(err, openAppt)
  })      

}

exports.list = function(req, res) {
  
  // let department = req.params.department

  let query = req.query 
  console.log(query)

  Appointment.find(query).populate('department', 'display').populate('candidate','lastName firstName').sort('appointment').exec((err, appointments) => {
    if (err) {
      return res.status(400).send({
        message: errorHandler.getErrorMessage(err)
      })      
    }             
    res.jsonp(appointments)        
  })      

}



exports.createAppointmentSchedule = function(req, res) {

  console.log('create schedule...')  

  let department = req.params.department

  async.waterfall([
    function findDepartment(next) {
      Department.findOne({ name: department.toUpperCase() }).exec((err, dept) => {
        if (!dept) {          
          return res.status(400).send({ message: 'Department not found' })
        }             
        next(err, dept)
      })
    },
    function createSchedule(dept, next) {
      createScheduleNow(dept, (err) => {
        next(err)
      })
    },
  ], (err) => {
    if (err) {
      console.log(err)
      return res.status(400).send({ message: errorHandler.getErrorMessage(err) })
    }     
    res.jsonp({ message: 'success!' })        
  })
}


function createScheduleNow(dept, cb) {

  // let interviewers = dept.interviewers
  // let interviewLength = dept.interviewLength  


  //1 hr = 3 600,000
  let hour = 3600000
  //1 minute = 60,000
  let minute = 60000

  let interviewers = 1
  let interviewLength = 15 * minute //convert to millisconds

  let totalMinutes = 9 * hour
  let interviewsPerHour = hour / (interviewers * interviewLength)
  let interviewsPerDay = interviewsPerHour * 9

  console.log('blocksPerHour: ' + interviewsPerHour)
  //should be june x 2018 after testing
  let now = new Date()
  console.log('now: ' + now)
  
  let startTimeMS = parseInt(now.setHours(8, 0, 0)) //start at 8am  
  console.log('start time MS: ' + startTimeMS)
  console.log('start time: ' + new Date(startTimeMS))
  

  async.times(interviewsPerDay, (index, callback) => {    
    console.log('index:' + index)
    console.log('startTime MS:' + startTimeMS)
    let appointment = new Appointment()
    appointment.department = dept    
    console.log('start time: ' + new Date(startTimeMS))
    appointment.appointment = new Date(startTimeMS)    
    startTimeMS += interviewLength
    appointment.save((err) => {      
      callback(err)
    })            
  }, (err) => {
    cb(err)
  })
}

// function getNextAvailableAppointment(candidate) {
  
//   return new Promise((resolve, reject) => {
//     Appointment.findOne({ department: candidate.department }).sort('-time').exec()
//       .then((appt) => {
//         resolve(appt ? appt.time : null)
//       })
//       .catch((err) => {
//         reject(err)
//       })        
//   })

// }


// }

exports.read = function(req, res) {

  let appointment = req.appointment ? req.appointment.toJSON() : {}
  res.jsonp(appointment)

}

/**
 * middleware
 */
exports.byID = function(req, res, next, id) {
  
  if (!mongoose.Types.ObjectId.isValid(id)) {
    return res.status(400).send({
      message: 'Appointment is invalid'
    });
  }

  Appointment.findById(id)
  .populate('candidate')
  .exec(function (err, appointment) {
    if (err) {
      return next(err)
    } else if (!appointment) {
      return res.status(404).send({
        message: 'No Appointment with that identifier has been found'
      });
    }      
    req.appointment = appointment 
    next()
  })

}