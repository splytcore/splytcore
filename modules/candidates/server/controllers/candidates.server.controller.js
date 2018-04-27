'use strict';

/**
 * Module dependencies.
 */
const path = require('path')
const mongoose = require('mongoose')

mongoose.Promise = require('bluebird')

const async = require('async')
const Candidate = mongoose.model('Candidate')  
const History = mongoose.model('History')  
const Review = mongoose.model('Review')  
const Position = mongoose.model('Position')  

const appointments = require(path.resolve('./modules/candidates/server/controllers/appointments.server.controller'))

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

exports.isRegistered = function(req, res, next) {
    
  console.log('isRegistered already?')

  let email = req.body.email  
  Candidate.findOne({ email: email }).exec((err, candidate) => {
    if (err) {
      console.log('err1 ' + err.toString())
      next(err)
    } else if (candidate) {
      console.log('err2 candidate with thatm email exists: ' + email)
      return res.status(400).send({
        message: 'You have already registered. Please checkin instead. Thank You!'
      })
    } else {
      console.log('new applicant')
      next()
    }
  })

}

exports.registerFromWeb = function(req, res) {
    
  console.log('registered from web')

  async.waterfall([
    function createCandidate (next) {                        
      let candidate = new Candidate(req.body)                        
      candidate.stage = 'REGISTERED'             
      //get whole position object         
      Position.findById(candidate.position).exec((err, position) => {
        if (err) {
          return next(err)
        }
        candidate.position = position
        candidate.save()
          .then((c) => {
            next(null, c)
          })
          .catch((err) => {
            next(err)
          })        
      })
    },    
    function registrationConfirmation(candidate, next) {
      var httpTransport = 'http://'
      if (config.secure && config.secure.ssl === true) {
        httpTransport = 'https://'
      }
      res.render(path.resolve('modules/candidates/server/templates/register-email'), {
        title: 'Blockchains, LLC Job Fair',
        content: 'You have successfully registered for the Blockchains, LLC Job Fair. <br/> Please check in when you get to the event.',
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
        // console.log('mailoptions')
        // console.log(mailOptions)
        smtpTransport.sendMail(mailOptions, function (err) {
          next(err)        
        })
      })
    }    
  ], (err) => {
    if (err) {      
      return res.status(400).send({ message: errorHandler.getErrorMessage(err) })
    }      
    res.status(200).send({
      message: 'Successfull Registered!'      
    })    
  })  

}

/**
 * Create a Candidate
 */
exports.registerFromMobile = function(req, res) {
    
  console.log('register from mobile device')

  let candidate = new Candidate(req.body)                        
  candidate.stage = 'QUEUE'          
  candidate.checkin = Date.now()
  //bind position since we only pass position id from front end  
  Position.findById(candidate.position).exec((err, position) => {
    if (err) {      
      return res.status(400).send({ message: errorHandler.getErrorMessage(err) })
    }       
    candidate.position = position
    candidate.save()
      .then((c) => {                
        global.emitCheckin ? global.emitCheckin(candidate): null // jshint ignore:line
        res.status(200).send({
          message: 'Successfull Registered!'      
        })                                  
      })
      .catch((err2) => {
        return res.status(400).send({ message: errorHandler.getErrorMessage(err2) })
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
  .then((result) => {
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
      Candidate.findOne({ email: email })
      .populate('notes.user', 'displayName')  
      .populate('department')  
      .populate('position')  
      .exec(function (err, candidate) {           
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
      candidate.stage = 'QUEUE'            
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
    console.log('about to check in')   
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
//Remove after user sign up is implemented for ios app
// exports.lockCandidate = function(req, res, next) {
//   let candidate = req.candidate
//   global.emitLockCandidate ? global.emitLockCandidate(candidate) : null  // jshint ignore:line
//   next()
// }

//Use after user sign up is implemented for ios app
exports.lockCandidate = function(req, res) {  
  
  console.log('locking candidate...')
  async.waterfall([
    function alreadyLocked(cb) {
      if (req.candidate.lockedBy) {
        return res.status(400).send({
          message: 'Sorry, Already Locke!'
        })  
      } else {
        cb()
      }
    },
    function oneLockLimit(cb) {

      Candidate.findOne({ lockedBy: req.user })
      .populate('notes.user', 'displayName')  
      .populate('department')  
      .populate('position')        
      .exec()
        .then((candidate) => {
          if (candidate) {
            return res.status(400).send({
              message: 'Sorry, you can only lock one candidate at a time'
            })  
          } else {                    
            cb()
          }                  
        })        
        .catch((err) => {
          console.log(err)
          cb(err)
        })
    },
    function lockCandidate(cb) {
      req.candidate.lockedBy = req.user
      let candidate = req.candidate      
      candidate.save()
        .then(() => {          
          cb(null, candidate)
        })
        .catch((err) => {
          cb(err)
        })      
    }
  ], (err, candidate) => {
    if (err) {
      console.log(err)      
      return res.status(400).send({
        message: errorHandler.getErrorMessage(err)
      })
    }      
    // emit to socket.io if no one is connected skip                    
    global.emitLockCandidate ? global.emitLockCandidate(candidate) : null  // jshint ignore:line
    res.jsonp(candidate)        
  })  
}

//Remove after user sign up is implemented for ios app
// exports.unlockCandidate = function(req, res) {
//   let candidate = req.candidate
//   global.emitUnlockCandidate ? global.emitUnlockCandidate(candidate) : null  // jshint ignore:line
//   res.jsonp({ message: 'you have unlocked this candidate' })    

// }

//Use after user sign up is implemented for ios app
exports.unlockCandidate = function(req, res) {  
  
  let candidate = req.candidate
  //if staff signed in
  if (!candidate.lockedBy) {
    return res.status(400).send({
      message: 'Candidate is not locked'
    })      
  }

  if (candidate.lockedBy._id.toString() === req.user._id.toString()) {
    candidate.lockedBy = null    
    candidate.save()
      .then(() => {
        global.emitUnlockCandidate ? global.emitUnlockCandidate(candidate) : null  // jshint ignore:line
        res.jsonp({ message: 'you have unlocked this candidate' })          
      })
      .catch((err) => {
        return res.status(400).send({
          message: errorHandler.getErrorMessage(err)
        })      
      })
  } else {
    res.status(400).send({ message: 'You cannot unlock this candidate because someone else has it locked' })    
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
  Candidate.find({ $or: [{ lastName: new RegExp(search, 'i') }, { email: new RegExp(search, 'i') }, { sms: search }] })
  .populate('notes.user', 'displayName')  
  .populate('department')  
  .populate('position')    
  .exec((err, candidates) => {    
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
  
  let registeredFrom = Candidate.schema.path('registeredFrom').enumValues
  let stages = Candidate.schema.path('stage').enumValues
  let valuations = Candidate.schema.path('valuation').enumValues

  res.jsonp({
    registeredFrom: registeredFrom,
    stages: stages,
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


  //pagination and sort
  let sort = req.query.sort ? req.query.sort : '-created'  
  delete req.query.sort     

  let page = req.query.page ? parseInt(req.query.page) : 1  
  delete req.query.page     
  
  let limit = req.query.limit ? parseInt(req.query.limit) : 1000
  delete req.query.limit     

  let skip = page === 1 ? 0 : (page - 1) * limit

  
  console.log('page: ' + page)
  console.log('limit: ' + limit)
  console.log('skip: ' + skip)

  //end pagination  

  console.log('post query')
  console.log(req.query)

  Candidate.find(req.query)
  .sort(sort)
  .populate('lockedBy', 'displayName')
  .populate('position')
  .populate('department')  
  .populate('notes.user', 'displayName')  
  .skip(skip)  
  .limit(limit)    
  .exec(function(err, candidates) {    
    if (err) {
      return res.status(400).send({
        message: errorHandler.getErrorMessage(err)
      })
    }             
    console.log('list length: ' + candidates.length)
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
  // console.log(candidate)

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
  async.parallel([
    function stageChanged(cb) {
      if (oldCandidate.stage !== updatedCandidate.stage) {        
        runStageChanged(req, res)
          .then((success) => {
            cb()
          })
          .catch((err) => {
            console.log(err)
            cb(err)
          })
      } else {
        cb()
      }
    },
    function valuationChanged(cb) {
      if (oldCandidate.valuation !== updatedCandidate.valuation) {
        runValuationChanged(req, res)
          .then((success) => {
            cb()
          })
          .catch((err) => {            
            cb(err)
          })        
      } else {
        cb()
      }
    }
  ], (err) => {
    if (err) {
      return res.status(400).send({
        message: errorHandler.getErrorMessage(err)
      })
    }   
    next()
  })
}
  
function runStageChanged(req, res) {    
  console.log('stage changed')  
  
  let candidate = req.candidate
  
  saveHistory(candidate, 'CHANGED_STAGE', req.user, req.body.stage)

  return new Promise((resolve, reject) => {
    switch (req.body.stage) {
      case 'REJECT':
      case 'DEFER':        
        client.messages.create({
          body: 'Blockchains: You do not have the skillz to pay the billz but you can enjoy the snacks and drinks you free loader!',
          to: '+1' + candidate.sms,  // Text this number
          from: config.twilio.from // From a valid Twilio number
        })
        .then((result) => {                
          global.emitRejectCandidate ? global.emitRejectCandidate(candidate) : null  // jshint ignore:line
          resolve()
        })
        .catch((err) => {
          console.log('sms error')
          console.log(err)
          reject()
        })
        break
      case 'INTERVIEW':
        appointments.setAppointment(candidate)
          .then((appt) => {
            console.log('time returned: ' + appt.appointment)            
            resolve()
          })
          .catch((err) => {
            reject(err)
          })
        break    
      case 'VALUATED':           
        console.log('status changed to valuated')        
        global.emitValuatedCandidate ? global.emitValuatedCandidate(candidate) : null  // jshint ignore:line                        
        resolve()        
        break
      default: 
        resolve()
    }  
  })
  
}

function runValuationChanged(req, res) {    
  console.log('valuation changed')

  let candiate = req.candidate
  
  return new Promise((resolve, reject) => {
    resolve()
  })

  
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
      if (req.file) {
        console.log(req.file.location)
        req.body.resumeDocURL = req.file.location.replace('blockchainscdn.s3.us-west-2.amazonaws.com', 'cdn.blockchains.com')             
      }
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

  Candidate.findById(id)
  .populate('lockedBy', 'displayName')
  .populate('notes.user', 'displayName')  
  .populate('department')
  .populate('position')
  .exec(function (err, candidate) {
    if (err) {
      return next(err);
    } else if (!candidate) {
      return res.status(404).send({
        message: 'No Candidate with that identifier has been found'
      });
    }      
    req.candidate = candidate    
    next();
  })


}

/**
 * Candidate middleware
 */
exports.candidateByEmail = function(req, res, next, email) {
  console.log(email)
  Candidate.findOne({ email: email })
  .populate('notes.user', 'displayName')  
  .populate('department')  
  .populate('position')  
  .exec(function (err, candidate) {
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