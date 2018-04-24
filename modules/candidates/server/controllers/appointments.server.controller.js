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

const moment = require('moment-timezone')


//@desc creates a schedule in x increments from now
exports.setAppointment = function(candidate) {

  return new Promise((resolve, reject) => {
    async.waterfall([
      function getNextAppointment(next) {        
        Appointment.findOneAndUpdate({ department: candidate.department, candidate: { $eq :null }}, { candidate: candidate }, { new: true }).sort('appointment').exec((err, openAppt) => {
          if (!openAppt) {
            let error = new Error() 
            error.code = 12001 //code pairs with no appointments found for deaprtment
            reject(error) //error code for finding no avialable appoitment for department
          } else {
            next(err, openAppt)
          }                       
        })      
      },
      function sendSMSAppointment(appt, next) {  
 
        console.log('appt time in moment: ' + moment(appt.appointment)) 
        let locale = moment(appt.appointment)
        let apptString = (new Date(locale)).toLocaleTimeString([], { hour: '2-digit', minute:'2-digit', hour12 : true })
        console.log(apptString)
        let message = `Blockchains: WE LIKA LIKA LIKA YOU ALOT! Please go to the ${candidate.department.display} department at ${apptString}`
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


exports.list = function(req, res) {
  
  // let department = req.params.department

  let query = req.query 
  console.log('query: ' + req.query)
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

exports.listByOpenApptsAndDept = function(req, res) {
        
  // let department = req.params.department
  console.log(req.params)
  let departmentId = req.params.department 

  Appointment.find({ department: departmentId, candidate: { $eq: null }}).populate('department', 'display').populate('candidate','lastName firstName').sort('appointment').exec((err, appointments) => {
    if (err) {
      return res.status(400).send({
        message: errorHandler.getErrorMessage(err)
      })      
    }             
    res.jsonp(appointments)        
  })      

}

exports.listByClosedApptsAndDept = function(req, res) {
  
  // let department = req.params.department
  console.log(req.params)
  let departmentId = req.params.department 

  Appointment.find({ department: departmentId, candidate: { $ne: null }}).populate('department', 'display').populate('candidate','lastName firstName').sort('appointment').exec((err, appointments) => {
    if (err) {
      return res.status(400).send({
        message: errorHandler.getErrorMessage(err)
      })      
    }             
    res.jsonp(appointments)        
  })      

}


//@desc references new candidate
exports.update = function(req, res) {
  
  let newAppt = req.appointment
  let candidateId = req.body.candidate

  async.waterfall([
    function checkIfRequestApptIsTaken(cb) {            
      if (newAppt.candidate) {
        return res.status(400).send({
          message: 'Sorry this appointment is already taken'
        })          
      } else {
        cb(null)
      }                
    },
    function getCandidate(cb) {          
      Candidate.findById(candidateId).populate('department').populate('positions').exec((err, candidate) => {
        cb(err, candidate)
      })
    },    
    function removeCandidateFromOldAppt(candidate, cb) {                                                                         
      Appointment.findOneAndUpdate({ candidate: candidate }, { candidate: null }).exec((err, appt) => {
        console.log('removing ref from ')
        console.log(appt)
        cb(err, candidate)
      })
    },
    function updateNewAppt(candidate, cb) {              
      newAppt.candidate = candidate
      newAppt.save((err) => {
        cb(err, candidate)
      })  
    },    
    function sendApptSMS(candidate, cb) {           
      console.log('appt time in moment: ' + moment(newAppt.appointment))        
      let locale = moment(newAppt.appointment).tz('America/Los_Angeles').format('h:ma z');  // 5am PDT

      let apptString = locale
      console.log(apptString)
      let message = `Blockchains: WE LIKA LIKA LIKA YOU ALOT! Please go to the ${candidate.department.display} department at ${apptString}`
      client.messages.create({
        body: message,
        to: '+1' + candidate.sms,  // Text this number
        from: config.twilio.from // From a valid Twilio number
      })
      .then((message) => {          
        candidate.appointment = newAppt.appointment //this is temp. only used for emiting correct appointment.
        global.emitInterviewCandidate ? global.emitInterviewCandidate(candidate) : null  // jshint ignore:line
        console.log('message for successful passing: ' + message)    
        cb()
      })
      .catch((err) => {
        console.log('sms error')
        console.log(err)
        cb(err)
      })    
    }
  ], (err) => {
    if (err) {
      console.log(err)      
      return res.status(400).send({
        message: errorHandler.getErrorMessage(err)
      })
    }       
    res.jsonp({ message: 'success' })
  })
}


//@desc if candidate decides to cancel appointment and not reschedule
exports.delete = function(req, res) {
  
  let appt = req.appointment  
  appt.candidate = null
  appt.save((err) => {
    if (err) {
      console.log(err)      
      return res.status(400).send({
        message: errorHandler.getErrorMessage(err)
      })
    }       
    res.jsonp({ message: 'success' })
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
  let minMS = 60000 //minute in milliseconds  

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
        startTimeMS += (dept.interviewLength * minMS)          
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
  .populate('department')
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