'use strict';

/**
 * Module dependencies.
 */
const path = require('path')
const mongoose = require('mongoose')
const async = require('async')
const Candidate = mongoose.model('Candidate')  
const History = mongoose.model('History')  
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
  let candidate = req.candidate
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
  .catch((err) => {
    console.log('sms error')
    console.log(err)
    return res.status(400).send({
      message: err
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
    }
    //TODO: send sms to applicant
  ], (err, candidate) => {
    if (err) {
      console.log(err)      
      return res.status(400).send({
        message: errorHandler.getErrorMessage(err)
      })
    }      
    // emit to socket.io if no one is connected skip                    
    global.emitCheckin ? global.emitCheckin(candidate): null // jshint ignore:line

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


exports.lockCandidate = function(req, res, next) {
    
  let candidate = req.candidate
  
  //if staff signed in  
  if (req.user && !candidate.lockedBy) {
    candidate.lockedBy = req.user
    candidate.save((err) => {
      if (err) {
        return res.status(400).send({
          message: errorHandler.getErrorMessage(err)
        })      
      }                     
      global.emitLockCandidate ? global.emitLockCandidate(candidate) : null  // jshint ignore:line
    })    
  } 

  next()
}

exports.unlockCandidate = function(req, res) {
    
  let candidate = req.candidate
  
  //if staff signed in      
  console.log(candidate.lockedBy._id)
  console.log(req.user._id)
  if (req.user && candidate.lockedBy._id.toString() === req.user._id.toString()) {
    candidate.lockedBy = null
    candidate.save((err) => {      
      if (err) {
        return res.status(400).send({
          message: errorHandler.getErrorMessage(err)
        })      
      }                           
      global.emitUnlockCandidate ? global.emitUnlockCandidate(candidate) : null  // jshint ignore:line
      res.jsonp({ message: 'you have unlocked this candidate' })    
    })    
  } else {
    res.jsonp({ message: 'You cannot unlock this candidate because someone else has it locked' })    
  }
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
  
  Candidate.find(req.query).sort(sort).populate('lockedBy', 'displayName').exec(function(err, candidates) {    
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
  
  let candidate = req.candidate  
  candidate = _.extend(candidate, req.body)  
  candidate.save(function(err) {
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
 * @desc perform action
 */

exports.performAction = function(req, res, next) {  

  let oldCandidate = req.candidate
  
  let updatedCandidate = req.body  
  
  //async
  if (oldCandidate.stage !== updatedCandidate.stage) {
    stageChanged(req, res)
  }

  if (oldCandidate.valuation !== updatedCandidate.valuation) {
    valuationChanged(req, res) 
  }

  if (oldCandidate.department !== updatedCandidate.department) {
    departmentChanged(req, res)
  }

  if (oldCandidate.position !== updatedCandidate.position) {
    positionChanged(req, res)
  }

  next()
}
  
function stageChanged(req, res) {    
  console.log('stage changed')
  saveHistory(req.candidate, 'CHANGED_STATE', req.user, req.body.stage)

}

function valuationChanged(req, res) {    
  console.log('valuation changed')
}

function departmentChanged(req, res) {    
  console.log('department changed')
}

function positionChanged(req, res) {    
  console.log('position changed')
}

function saveHistory(candidate, action, user, from, to) {    
  
  let history = new History()
  history.candidate = candidate
  history.action = action
  history.user = user
  history.from = from
  history.to = to
  history.save((err) => {
    console.log('action saved to history')
  })  

}


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
      console.log('mimetype: ' + file.mimetype)
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
    
    let params = { layout: 'portrait', size: 'letter' }
    let slide = new PDFImagePack(params)

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


//@desc Upload merged pdf to S3
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
        let maxAge = 3600 * 24 * 365                 
        let params = { 
          Bucket: 'blockchainscdn', 
          Key: 'uploads/resumes/' + Date.now() + '.pdf',
          ContentType: 'application/pdf',
          CacheControl: `max-age=${maxAge}`,
          Body: pdfFile 
        }
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
      let CDN_URL = S3URL.replace('blockchainscdn.s3.us-west-2.amazonaws.com', 'cdn.blockchains.com')             
      console.log('S3 URL: ' + S3URL)
      console.log('CDN URL: ' + CDN_URL)
      req.body.resumeDocURL = CDN_URL     
      next()
    })
  } else {
    next()
  }
}

//Upload document to S3
exports.uploadDocToS3 = function(req, res, next) {

  let maxAge = 3600 * 24 * 365                 

  let upload = multer({
    storage: multerS3({
      s3: s3,
      bucket: 'blockchainscdn',      
      contentType: multerS3.AUTO_CONTENT_TYPE,      
      cacheControl: `max-age=${maxAge}`,
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
      req.body.resumeDocURL = req.file.location.replace('blockchainscdn.s3.us-west-2.amazonaws.com', 'cdn.blockchains.com')             
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

  Candidate.findById(id).populate('lockedBy', 'displayName').exec(function (err, candidate) {
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