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


exports.createAppointmentScheduleForAllDepartment = function(req, res) {

  console.log('create schedule for all...')  

  async.waterfall([
    function getAllDepartments(next) {
      Department.find().exec((err, depts) => {
        if (!depts) {          
          return res.status(400).send({ message: 'No Departments found' })
        }             
        next(err, depts)
      })
    },
    function createScheduleForEachDept(depts, next) {
      async.each(depts, (dept, callback) => {            
        createScheduleNow(dept, (err) => {
          callback(err)
        })
      }, (err) => {
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



exports.createAppointmentScheduleByDepartment = function(req, res) {

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

  console.log('creating schedule for : ' + dept.display)
  console.log('number of interviewers: ' + dept.interviewers)
  console.log('Interview length per interviewer: ' + dept.interviewLength)

  async.times(dept.interviewers, (index, callback) => {    
    console.log('index:' + index)
    createSchedulePerUser(dept, (err, result) => {
      callback(err)
    })    
  }, (err) => {
    cb(err)
  })
}

function createSchedulePerUser(dept, done) {
  
  let now = new Date()
  
  let startTimeMS = parseInt(now.setHours(8, 0, 0)) //start at 8am
  let endTimeMS = parseInt(now.setHours(17, 0, 0)) //end at 5pm

  async.whilst(
    function() { 
      return startTimeMS < endTimeMS
    },
    function(callback) {
      let appointment = new Appointment()
      appointment.department = dept    
      console.log('start time: ' + new Date(startTimeMS))
      appointment.appointment = new Date(startTimeMS)          
      appointment.save((err) => {      
        startTimeMS += (dept.interviewLength * 60000)          
        callback(err, startTimeMS)
      })                              
    },
    function (err, n) {
      console.log('finished')
      console.log(n)
      // 5 seconds have passed, n = 5
      done(err,n)
    }
  )
}


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