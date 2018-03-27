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
const twilioClient = twilio(config.twilio.SID, config.twilio.authToken).lookups.v1
const PDFImagePack = require('pdf-image-pack')

    

/**
 * Create a Candidate
 */
exports.register = function(req, res) {
    
  console.log('time to register')

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
            
      //if registered from tablet check in
      if (candidate.registeredFrom.indexOf('MOBILE') > -1) {
        candidate.stage = 'QUEUE'          
        candidate.appointment = req.body.appointment ? parseInt(req.body.appointment) : (Date.now() + 3600000) // 1 hour
      }      

      candidate.save((err) => {
        next(err, candidate)
      })
    },
    function checkinIfMobile(candidate, next) {                        
      if (candidate.registeredFrom.indexOf('MOBILE') > -1) {
        let appt = candidate.appointment.toLocaleTimeString([], { hour: '2-digit', minute:'2-digit' })
        console.log('phone: ' + candidate.sms)
        client.messages.create({
          body: 'You have registered and checked in at Blockchains.com! Your appointment with HR is at '+ appt,
          to: '+1' + candidate.sms,  // Text this number
          from: config.twilio.from // From a valid Twilio number
        })
        .then((message) => {
          next(null, candidate)
        })
        .catch((err) => {
          console.log('sms error')
          console.log(err)
          next(err)
        })
      } else {
        next(null, candidate)
      }
    },    
    function emailOnlyForWebRegistration(candidate, next) {
      if (candidate.registeredFrom.indexOf('MOBILE') > -1) {
        next(null)
      } else {
        var httpTransport = 'http://'
        if (config.secure && config.secure.ssl === true) {
          httpTransport = 'https://'
        }
        res.render(path.resolve('modules/candidates/server/templates/register-email'), {
          name: candidate.firstName,
          appName: config.app.title,
          url: httpTransport + req.headers.host
        }, function (err, emailHTML) {              
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
        })
      }
    }    
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
      console.log('phone: ' + candidate.sms)
      let appt = candidate.appointment.toLocaleTimeString([], { hour: '2-digit', minute:'2-digit' })
      client.messages.create({
        body: 'You have checked in at Blockchains.com! Your appointment with HR is at '+ appt,
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
    // emit to socket.io if no one is connected skip                    
    global.emitCheckin ? global.emitCheckin(): null // jshint ignore:line

    res.status(200).send({
      message: 'Successfull Checked in!'      
    })    
  })  
}
/** 
 * Find Candidate By Email
 * @function
 * @name findByEmail
 * @param {object} req
 * @param {object} res
 * @desc find candidate by email
 * 
 */
exports.findByEmail = function(req, res) {
    
  let candidate = req.candidate
  res.jsonp(candidate)

}


/** 
 * 
 * @function
 * @name findCandidate
 * @param {object} req
 * @param {object} res
 * @desc find candidate email, last name, or sms
 * 
 */

exports.findCandidate = function(req, res) {
  
  //TODO: mininum length?  
  let search = req.params.search

  console.log(search)
  Candidate.find({ $or: [{ lastName: new RegExp(search, 'i') }, { email: new RegExp(search, 'i') }, { sms: search }] }, (err, candidates) => {    
    if (err) {
      return res.status(400).send({
        message: errorHandler.getErrorMessage(err)
      })      
    } 
    res.jsonp(candidates)
  })

}

/*
* List enum values
* @param field from the model i.e /api/candidatesEnum/department
* @return list of values in array format
*/

exports.listEnumValues = function(req, res) {  
  
  let field = req.params.field;
  console.log(field)

  let values = Candidate.schema.path(field).enumValues
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

  // TODO: pagination
  // let limit = req.query.page ? parseInt(req.query.page) : 20   
  // delete req.query.limit
  //skip results for pagination
  // let skip = req.query.skip ? parseInt(req.query.skip) * limit  : 0
  // delete req.query.skip
  let limit = req.query.page ? parseInt(req.query.page) : 20 

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
 * Validate Phone
 */
exports.validatePhone = function(req, res) {  
  
  console.log(req.params.phone)
  let phone = '+1' + req.params.phone

  twilioClient.phoneNumbers(phone).fetch()
    .then((number) => {        
      console.log(number)
      res.jsonp({ message: 'success' })
    })
    .catch((err) => {
      console.log(err)    
      return res.status(400).send({ message: 'invalid number' })    
    })  
  
}


/**
 * Delete an Candidate
 */
exports.delete = function(req, res) {
  var candidate = req.candidate

  candidate.remove(function(err) {
    if (err) {
      return res.status(400).send({
        message: errorHandler.getErrorMessage(err)
      })
    } else {
      res.jsonp(candidate)
    }
  })
}


/**
 * Upload resume image
 */
exports.uploadImageResume = function (req, res, next) {  

  console.log('upload images')

  let storage = multer.diskStorage({
    destination: function (req, file, cb) {
      cb(null, config.uploads.resumeUpload.dest)
    },
    filename: function (req, file, cb) {
      // console.log('file')
      // console.log(file)
      let ext = ''                    
      switch(file.mimetype) {
        case 'image/jpeg':
          ext = '.jpg'
          break
        case 'image/jpg':
          ext = '.jpg'
          break;              
        case 'image/png':
          ext = '.png'            
          break
        case 'image/gif':
          ext = '.gif'            
          break
        case 'image/bmp':
          ext = '.bmp'            
          break              
        default:
          ext = '.jpg'                          
      }                
      cb(null, Date.now() + ext)
    }
  })  

  let fileFilter = require(path.resolve('./config/lib/multer')).imageUploadFileFilter
  let upload = multer({ storage: storage, fileFilter: fileFilter }).array('newResumeImages', 5)

  // // Filtering to upload only images      
  upload(req, res, (uploadError) => {
    if(uploadError) {
      return res.status(400).send({
        message: uploadError.toString()
      })
    } else {
      let resumeImageURLS = []
      async.each(req.files, (file, callback) => {  
        console.log('filename: ' + config.uploads.resumeUpload.dest + file.filename)        
        resumeImageURLS.push(config.uploads.resumeUpload.dest + file.filename)        
        callback()
      }, (err) => {
        if(err) {
          return res.status(400).send({ message: errorHandler.getErrorMessage(err) })
        }           
        req.body.resumeImageURLS = resumeImageURLS
        next()
      })
    }
  })
}

/**
 * convert all images into 1 pdf file
 */
exports.mergeImagesToPDF = function (req, res, next) {

  console.log('merging and convert to single pdf')
  // var imgs = [
  //   "./fixture/basic/a.png",
  //   "./fixture/basic/b.png",
  // ]
  let output = config.uploads.resumeUpload.dest + Date.now() + '.pdf'
  let slide = new PDFImagePack()

  slide.output(req.body.resumeImageURLS, output, function(err, doc){    
    req.body.resumeDocURL = output      
    next()
  })

}


/**
 * Upload Document resume
 */
exports.uploadDocResume = function (req, res, next) {
    
  console.log('upload doc')
  let storage = multer.diskStorage({
    destination: function (req, file, cb) {
      cb(null, config.uploads.resumeUpload.dest)
    },
    filename: function (req, file, cb) {
      console.log('file extension: ' + file.mimetype)
      let ext = ''                    
      switch(file.mimetype) {
        case 'application/pdf':
          ext = '.pdf'
          break
        case 'text/plain':
          ext = '.txt'
          break
        case 'application/msword':
          ext = '.doc'            
          break                  
        case 'application/vnd.openxmlformats-officedocument.wordprocessingml.document':
          ext = '.docx'            
          break
        default:
          ext = '.pdf'                          
      }                    
      cb(null, Date.now() + ext)
    }
  })      

  let fileFilter = require(path.resolve('./config/lib/multer')).docUploadFileFilter
  let upload = multer({ storage: storage, fileFilter:  fileFilter }).single('newResumeDoc')                                                                            
  
  upload(req, res, (uploadError) => {
    if(uploadError) {      
      console.log(uploadError)
      return res.status(400).send({
        message: uploadError.toString()
      })
    } else {      
      console.log(config.uploads.resumeUpload.dest + req.file.filename)      
      req.body.resumeDocURL = config.uploads.resumeUpload.dest + req.file.filename
      next(null)      
    }
  })
}

exports.test = function(req, res) {
  res.send('success!!')
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
  console.log(email)
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