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

const momenttz = require('moment-timezone')

const commons = require(path.resolve('./modules/candidates/server/controllers/commons.server.controller'))

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
         
        let apptString = momenttz(appt.appointment).tz('America/Los_Angeles').format('h:mm a z M/D/YYYY')
        console.log(apptString)
        let message = `Blockchains: WE LIKA LIKA LIKA YOU ALOT! Please go to the ${candidate.department.display} department at ${apptString}`
        message += 'If you would like to cancel your appointment please reply with decline'              
        commons.sendSMS(candidate.sms, message)
          .then((result) => {          
            candidate.appointment = appt //this is temp. only used for emiting correct appointment.
            global.emitInterviewCandidate ? global.emitInterviewCandidate(candidate) : null  // jshint ignore:line          
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


//@desc drops Appointments collection
exports.dropCollection = function(req, res) {
  
  Appointment.remove().exec((err) => {
    if (err) {
      return res.status(400).send({
        message: errorHandler.getErrorMessage(err)
      })      
    }                 
    res.jsonp({ message: 'success!' })   
  })      

}

//@desc removes all appointments by department
exports.deleteAppointmentScheduleByDepartment = function(req, res) {

  let department = req.department
  console.log('department: ' + department)

  Appointment.remove({ department: department }).exec((err) => {
    if (err) {
      return res.status(400).send({
        message: errorHandler.getErrorMessage(err)
      })      
    }                 
    res.jsonp({ message: 'success!' })   
  })      

}

exports.listByOpenApptsAndDept = function(req, res) {
        
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
        // console.log('removing ref from ')
        // console.log(appt)
        cb(err, candidate)
      })
    },
    function updateNewAppt(candidate, cb) {              
      newAppt.candidate = candidate
      newAppt.save((err) => {
        cb(err)
      })  
    },    
    function sendApptSMS(cb) {           
      console.log('appt time in GMT : ' + newAppt.appointment)              
      let apptString = momenttz(newAppt.appointment).tz('America/Los_Angeles').format('h:mm a z M/D/YYYY')
      console.log('appt time in PST: ' + apptString)
      let message = `Blockchains: WE LIKA LIKA LIKA YOU ALOT! Please go to the ${newAppt.candidate.department.display} department at ${apptString}.`
      message += 'If you would like to cancel your appointment please reply with decline'      
      commons.sendSMS(newAppt.candidate.sms, message)
        .then((result) => {
          // candidate.appointment = newAppt //this is temp. only used for emiting correct appointment.
          global.emitInterviewCandidate ? global.emitInterviewCandidate(newAppt.candidate) : null // jshint ignore:line
          cb()
        })
        .catch((err) => {
          // console.log('sms error')
          // console.log(err)
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
  let sms = appt.candidate.sms
  appt.candidate = null
  appt.save((err) => {
    if (err) {
      return res.status(400).send({
        message: errorHandler.getErrorMessage(err)
      })
    }           
  })
  
  let message = 'Your appointment have been canceled. If you would like to reschedule, please see a staff member.'
  commons.sendSMS(sms, message)
    .then(() => {
      console.log('success cancel sms sent')
      res.jsonp({ message: 'success' })
    })
    .catch((err) => {          
      console.log(err)
      return res.status(400).send({
        message: 'error sending sms cancel appointment'
      })      
    })  

}

//@desc cancel appt by candidates responding by SMS
//Current Twilio has it set to scotts server
//TODO: switch to instance gage set up
exports.cancelBySMS = function(req, res) {
  
  console.log('cancel by SMS body:')
  console.log(req.body)    

  let sms = req.body.From.replace('+1', '')
  let responseString = req.body.Body.toUpperCase()
  console.log('tele: ' + sms)

  if (responseString.indexOf('DECLINE') > -1) {
    async.waterfall([
      function findCandidate(next) {
        Candidate.findOne({sms: sms}).exec((err, candidate) => {
          if (!candidate) {
            return res.status(400).send({ message: 'candidate not found' })    
          } else {
            next(err, candidate)
          }
        })
      },
      function findAppointment(candidate, next) {
        Appointment.findOneAndUpdate({ candidate : candidate }, { candidate: null }).exec((err, appt) => {
          if (!appt) {      
            return res.status(400).send({ message: 'appointment not found by number' })
          } else {
            next(err)            
          }
        })
      },
      function sendCancelSMS(next) {
        let message = 'Your appointment have been canceled. If you would like to reschedule, please see a staff member.'
        commons.sendSMS(sms, message)
          .then(() => {
            console.log('success cancel sms sent')
            next()
          })
          .catch((err) => {          
            return res.status(400).send({ message: 'Error sending sms canceling appointment' })
          })    
      }
    ], (err) => {
      if (err) {
        console.log(err)
        return res.status(400).send({ message: errorHandler.getErrorMessage(err) })
      }     
      res.jsonp({ message: 'appointment canceled succssfully!' })        
    })        
  } else {
    res.jsonp({ message: 'candidate SMS texted backed with ' + responseString })        
  }
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

  let department = req.department
  console.log('create schedule for deptId: ' + department)  

  async.waterfall([
    function createSchedule(next) {
      createScheduleNow(department, (err) => {
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
    createSchedulePerInterviewer(dept, (err, result) => {
      callback(err)
    })    
  }, (err) => {
    cb(err)
  })
}

function createSchedulePerInterviewer(dept, done) {
  
  // let now = new Date()
  let june1start = new Date(2018, 5, 1, 8, 0, 0, 0) //june 1 8am
  let june1end =   new Date(2018, 5, 1, 17, 0, 0, 0) //june1 5pm
  
  let june2start = new Date(2018, 5, 2, 8, 0, 0, 0) //june2 8am
  let june2end =   new Date(2018, 5, 2, 17, 0, 0, 0) //june2 5pm

  let startTimeMS = june1start.getTime() //start at 8am
  let endTimeMS =   june2end.getTime() //end at 5pm next day

  let minMS = 60000 //minute in milliseconds  

  async.whilst(
    function() { 
      return startTimeMS < endTimeMS
    },
    function(callback) {
      //block appointments afterhours between june 1 5pm to june 2 8am
      if (startTimeMS > june1end.getTime() && startTimeMS < june2start.getTime() ) {
        startTimeMS += (dept.interviewLength * minMS)          
        callback(null, startTimeMS)          
      //block lunch 12pm - 1pm
      } else if ((new Date(startTimeMS)).getHours() > 11 && (new Date(startTimeMS)).getHours() < 13) {
        startTimeMS += (dept.interviewLength * minMS)          
        callback(null, startTimeMS)          
      } else {
        let appointment = new Appointment()
        appointment.department = dept    
        console.log('start time: ' + new Date(startTimeMS))
        appointment.appointment = new Date(startTimeMS)          
        
        appointment.save((err) => {      
          startTimeMS += (dept.interviewLength * minMS)          
          callback(err, startTimeMS)          
        })    
      }                          
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