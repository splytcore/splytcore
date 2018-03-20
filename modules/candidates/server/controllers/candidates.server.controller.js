'use strict';

/**
 * Module dependencies.
 */
const path = require('path')
const mongoose = require('mongoose')
const async = require('async')
const Candidate = mongoose.model('Candidate')  
const errorHandler = require(path.resolve('./modules/core/server/controllers/errors.server.controller'))
const _ = require('lodash')

const config = require(path.resolve('./config/config'))
const nodemailer = require('nodemailer')
const crypto = require('crypto')
const smtpTransport = nodemailer.createTransport(config.mailer.options)

const twilio = require('twilio')
const client = new twilio(config.twilio.SID, config.twilio.authToken)
const multer = require('multer')

/**
 * Create a Candidate
 */
exports.register = function(req, res) {
  
  async.waterfall([
    function isRegistered (next) {
      let email = req.body.email
      Candidate.findOne({ email: email }, (err, candidate) => {    
        if (err) {
          next(err)
        } else if (candidate) {
          return res.status(400).send({
            message: 'You have already registered. Please checkin instead. Thank You!'
          })
        } else {
          console.log('new applicant')
          next(null)
        }
      })
    },
    function createCandidate (next) {                        
      let candidate = new Candidate(req.body)      
      candidate.save((err) => {
        next(err, candidate)
      })
    },
    function prepareEmail(candidate, done) {
      var httpTransport = 'http://'
      if (config.secure && config.secure.ssl === true) {
        httpTransport = 'https://'
      }
      res.render(path.resolve('modules/candidates/server/templates/register-email'), {
        name: candidate.firstName,
        appName: config.app.title,
        url: httpTransport + req.headers.host
      }, function (err, emailHTML) {
        done(err, emailHTML, candidate);
      })
    },
    // If valid email, send reset email using service
    function (emailHTML, candidate, next) {
      var mailOptions = {
        to: candidate.email,
        from: config.mailer.from,
        subject: 'Registration',
        html: emailHTML
      }
      console.log('mailoptions')
      console.log(mailOptions)
      smtpTransport.sendMail(mailOptions, function (err) {
        next(err)        
      })
    }
    //TODO: send confirmation code to application
  ], (err) => {
    if (err) {
      console.log(err)
      return res.status(400).send({ message: errorHandler.getErrorMessage(err) })
    }      
    res.status(200).send({
      message: 'Successfull Registered!'      
    })    
  })  

}

/**
 * Checkin candidates 
 * Send sms with confirmation code with scheduled time
 */
exports.checkin = function(req, res) {
  
  console.log(req.body)

  async.waterfall([
    function isRegistered (next) {
      let email = req.body.email
      Candidate.findOne({ email: email }, (err, candidate) => {    
        if (err) {
          next(err)
        } else if (!candidate) {
          return res.status(400).send({
            message: 'User not found! Are you registered?'
          })
        } else {
          next(null, candidate)
        }
      })
    },
    function isCheckedin (candidate, next) {      
      if (candidate.stage.indexOf('QUEUE') > -1) {
        return res.status(400).send({
          message: 'You are already checked in!'
        })
      } else {
        next(null, candidate)  
      }          
    },    
    function schedule (candidate, next) {                                          
      candidate.checkin = Date.now()
      candidate.appointment = req.body.appointment ? parseInt(req.body.appointment) : (Date.now() + 3600000) // 1 hour
      candidate.stage = 'QUEUE'      
      candidate.department = 'HR'      
      candidate.save((err) => {
        next(err, candidate)
      })
    },
    function sendSMS (candidate, next) {                                          
      let appt = candidate.appointment.toLocaleTimeString([], { hour: '2-digit', minute:'2-digit' })
      client.messages.create({
        body: 'You have checked in at Blockchains.com! Your appointment is at '+ appt,
        to: '+1' + candidate.sms,  // Text this number
        from: config.twilio.from // From a valid Twilio number
      })
      .then((message) => {
        next(null)
      })
      .catch((err) => {
        next(err)
      })
    }
    //TODO: send sms to applicant
  ], (err) => {
    if (err) {
      console.log(err)      
      return res.status(400).send({
        message: errorHandler.getErrorMessage(err)
      })
    }      
    global.emitCheckin() //emit to socket.io 
    res.status(200).send({
      message: 'Successfull Checked in!'      
    })    
  })  
}

/**
 * find candidate with matching email, lastname, or sms
 * 
 */
exports.findCandidate = function(req, res) {
  
  //TODO: mininum length?  
  let q = req.query.q

  console.log(q)
  Candidate.find({ $or: [{ lastName: new RegExp(q, 'i') }, { email: new RegExp(q, 'i') }, { sms: q }] }, (err, candidates) => {    
    if (err) {
      return res.status(400).send({
        message: errorHandler.getErrorMessage(err)
      })      
    } 
    res.jsonp(candidates)
  })

}

/*
* List enum stage values
*
*/

exports.listEnumStages = function(req, res) {  
    
  let values = Candidate.schema.path('stage').enumValues
  res.jsonp(values)

}

/*
* List enum statuses values
*
*/

exports.listEnumStatuses = function(req, res) {      
  let values = Candidate.schema.path('status').enumValues
  res.jsonp(values)
}

/*
* List candidates according to query
* Params are all fields in Candidate model
*/

exports.list = function(req, res) {  
  
  console.log('pre query')
  console.log(req.query)

  let sort = req.query.sort ? req.query.sort : '-created'
  delete req.query.sort 

  //default results per page
  // let limit = req.query.limit ? parseInt(req.query.limit) : 20 
  // delete req.query.limit
  //skip results for pagination
  // let skip = req.query.skip ? parseInt(req.query.skip) * limit  : 0
  // delete req.query.skip


  console.log('post query')
  console.log(req.query)
  
  Candidate.find(req.query).sort(sort).exec(function(err, candidates) {    
    if (err) {
      return res.status(400).send({
        message: errorHandler.getErrorMessage(err)
      })
    }       
    res.jsonp(candidates)
  })
}

/**
 * Show the current Candidate
 */
exports.read = function(req, res) {
  // convert mongoose document to JSON
  var candidate = req.candidate ? req.candidate.toJSON() : {};

  // Add a custom field to the Article, for determining if the current User is the "owner".
  // NOTE: This field is NOT persisted to the database, since it doesn't exist in the Article model.
  candidate.isCurrentUserOwner = req.user && candidate.user && candidate.user._id.toString() === req.user._id.toString();

  res.jsonp(candidate);
};

/**
 * Update a Candidate
 */
exports.update = function(req, res) {
  console.log(req.body)
  
  var candidate = req.candidate;
  candidate = _.extend(candidate, req.body.candidate)
    
  if (req.body.note && req.body.note.length > 0) {    
    candidate.notes.push({ note: req.body.note, user: req.user })
  }

  candidate.save(function(err) {
    if (err) {
      return res.status(400).send({
        message: errorHandler.getErrorMessage(err)
      });
    } else {
      res.jsonp(candidate);
    }
  });
};

/**
 * Delete an Candidate
 */
exports.delete = function(req, res) {
  var candidate = req.candidate;

  candidate.remove(function(err) {
    if (err) {
      return res.status(400).send({
        message: errorHandler.getErrorMessage(err)
      });
    } else {
      res.jsonp(candidate);
    }
  });
};

/**
 * Upload resume
 */
exports.uploadResume = function (req, res) {
  
  let email = req.query.email
  
  Candidate.findOne({ email: email }).exec(function (err, candidate) {
    if (err) {
      return res.status(400).send({
        message: errorHandler.getErrorMessage(err)
      })
    } else if (!candidate) {
      return res.status(400).send({
        message: 'Candidate not found'
      })      
    } else {
      let upload = multer(config.uploads.resumeUpload).single('newResumePicture')
      let resumeUploadFileFilter = require(path.resolve('./config/lib/multer')).imageUploadFileFilter
      
      // Filtering to upload only images
      upload.fileFilter = resumeUploadFileFilter;

      upload(req, res, function (uploadError) {
        if(uploadError) {
          return res.status(400).send({
            message: 'Error occurred while uploading resume'
          })
        } else {
          console.log(config.uploads.resumeUpload.dest + req.file.filename)
          candidate.resumeURL = config.uploads.resumeUpload.dest + req.file.filename
          candidate.save((err) => {
            if(err) {
              return res.status(400).send({ message: errorHandler.getErrorMessage(err) })
            } else {
              res.send({ url: config.uploads.resumeUpload.dest + req.file.filename })
            }
          })          
        }
      })
    }
  })
}


/**
 * Candidate middleware
 */
exports.candidateByID = function(req, res, next, id) {
  
  if (!mongoose.Types.ObjectId.isValid(id)) {
    return res.status(400).send({
      message: 'Candidate is invalid'
    });
  }

  Candidate.findById(id).populate('user', 'displayName').exec(function (err, candidate) {
    if (err) {
      return next(err);
    } else if (!candidate) {
      return res.status(404).send({
        message: 'No Candidate with that identifier has been found'
      });
    }
    req.candidate = candidate;
    next();
  })
}

/**
 * Candidate middleware
 */
exports.candidateByEmail = function(req, res, next, email) {
  console.log('middlware emial: ' + email)
  Candidate.findOne({ email: email }).exec(function (err, candidate) {
    if (err) {
      return next(err)
    } else if (!candidate) {
      return res.status(404).send({
        message: 'No Candidate with that email has been found'
      })
    }
    req.candidate = candidate
    next()
  })

}