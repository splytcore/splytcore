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

const fs = require('fs')
const AWS = require('aws-sdk')
const multerS3 = require('multer-s3')

const s3 = new AWS.S3(config.S3)

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
 * Send a SMS message confirming successful registration to a candidate (given a valid @email)
 */
exports.sendRegisteredText = function(req, res) {
  Candidate.findOne({ email: req.body.email }, (err, candidate) => { 
    if(err) {
      return res.status(400).send({
        message: err
      })
    }
    if(candidate) {
      client.messages.create({
        body: 'Blockchains: Thank you for checking in. We will text you soon with further instructions.',
        to: '+1' + candidate.sms,  // Text this number
        from: config.twilio.from // From a valid Twilio number
      })
      .then((message) => {
        return res.send({
          message: `Successfully sent SMS to ${candidate.sms} `
        })
      })
      .catch((err2) => {
        console.log('sms error')
        console.log(err2)
        return res.status(400).send({
          message: err2
        })
      })
    } else {
      return res.status(400).send({
        message: 'User not found!'
      })
    }
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
* List all enum values
* @return list  all values in array format
*/
exports.listAllEnumValues = function(req, res) {  
  
  let departments = Candidate.schema.path('department').enumValues
  let registeredFrom = Candidate.schema.path('registeredFrom').enumValues
  let stages = Candidate.schema.path('stage').enumValues
  let positions = Candidate.schema.path('position').enumValues
  let valuations = Candidate.schema.path('valuation').enumValues

  res.jsonp({
    departments: departments,
    registeredFrom: registeredFrom,
    stages: stages,
    positions: positions,
    valuations: valuations
  })
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
 * @desc Upload resume images to our server first. Then merge to a single PDF. Then upload to S3 bucket
 * 
 */
exports.uploadResumeImages = function (req, res, next) {  

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
  let upload = multer({ storage: storage, fileFilter: fileFilter }).array('newResumeImages', 25)

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
 * @desc Convert all images into 1 pdf file
 */
exports.mergeImagesToPDF = function (req, res, next) {

  if (req.body.resumeImageURLS.length > 0) {
    
    console.log('merging and convert to single pdf')
    let outputPath = config.uploads.resumeUpload.dest + Date.now() + '.pdf'
    let slide = new PDFImagePack()

    console.log('image urls: ')
    console.log(req.body.resumeImageURLS)
    console.log('destination: ' + outputPath)

    slide.output(req.body.resumeImageURLS, outputPath, function(err, doc){    
      req.body.pdfPath = outputPath      
      next()
    })
  } else {
    next()
  }

}


//Upload images to S3
exports.uploadPDFtoS3 = function(req, res, next) {
  
  if (req.body.resumeImageURLS.length > 0) {
    async.waterfall([
      function readPDF (cb) {  
        let pdfPath = req.body.pdfPath
        console.log('path: ' + pdfPath)      
        console.log(pdfPath)      
        fs.readFile(pdfPath, function(err,data) {
          cb(err, data)          
        })
      },
      function uploadPDF (pdfFile, cb) {                       
        let params = { Bucket: 'blockchainscdn', Key: 'uploads/resumes/' + Date.now() + '.pdf', Body:pdfFile }
        s3.upload(params, function(err, data) {
          console.log(data)
          cb(err, data.Location)            
        })      
      }
    ], (err, S3URL) => {
      if (err) {
        console.log(err)
        return res.status(400).send({ message: errorHandler.getErrorMessage(err) })
      } 
      console.log('S3 URL: ' + S3URL)             
      req.body.resumeDocURL = S3URL     
      next()
    })     
  } else {
    next()
  }

}

//Upload document to S3
exports.uploadDocToS3 = function(req, res, next) {

  let upload = multer({
    storage: multerS3({
      s3: s3,
      bucket: 'blockchainscdn',
      metadata: function (req, file, cb) {        
        cb(null, { fieldName: file.fieldname });
      },
      key: function (req, file, cb) {
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
        cb(null, 'uploads/resumes/' + Date.now().toString() + ext)
      }
    })
  }).single('newResumeDoc', 10)      

  upload(req, res, (uploadError) => {
    if(uploadError) {
      return res.status(400).send({
        message: uploadError.toString()
      })
    } else {            
      console.log(req.file.location)
      req.body.resumeDocURL = req.file.location
      next()
    }
  })
}

/**
 * @desc Delete working files from local server
 */
exports.deleteWorkingFiles = function(req, res, next) {
   
  if (req.body.resumeImageURLS.length > 0) {
  
    let filesPath = req.body.resumeImageURLS
    filesPath.push(req.body.pdfPath)
    console.log('delete temp files..')
    console.log(filesPath)

    async.each(filesPath, (file, callback) => {  
      fs.unlink(file, function(err){                    
        callback(err)
      })
    }, (err) => {
      if(err) {
        return res.status(400).send({ message: errorHandler.getErrorMessage(err) })
      }             
      next()
    })
  } else {
    next()    
  }

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