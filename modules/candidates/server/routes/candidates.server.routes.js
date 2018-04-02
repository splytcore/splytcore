'use strict';

/**
 * Module dependencies
 */
let candidatesPolicy = require('../policies/candidates.server.policy')
let candidates = require('../controllers/candidates.server.controller')

module.exports = function(app) {
  // Candidates Routes
  
  //@desc candidate checks in from tablet
  app.route('/api/checkin')
    .post(candidates.checkin) 
            
  //@desc register from our tablet
  //upload images to server, merge into PDF, then upload to S3 bucket
  app.route('/api/register/MOBILE')    
    .post(candidates.uploadResumeImages, candidates.mergeImagesToPDF, candidates.uploadPDFtoS3, candidates.deleteWorkingFiles, candidates.register)
             
  //@desc register from our web site.
  //uploads document to S3 bucket
  app.route('/api/register/WEB')
    .post(candidates.uploadDocToS3, candidates.register)       

  //@desc find candidates by email
  app.route('/api/candidateByEmail/:email')
    .get(candidates.findByEmail)   

  //@desc find candidates by email, last name, sms
  //i.e. /api/findCandidate?q=john@gmail.com
  //i.e. /api/findCandidate?q=smith
  //i.e. /api/findCandidate?q=81812345678
  app.route('/api/findCandidate/:search')
    .get(candidates.findCandidate)   

  //@desc validate phone through twilio validation
  app.route('/api/validatePhone/:phone')
    .get(candidates.validatePhone)    

  //@desc return all candidates 
  //you can append addition parameters to filter
  //i.e. ?stage=REGISTERED&registeredFrom=WEB
  app.route('/api/candidates')
    .get(candidates.list)    

  //@desc returns list of ALL enum values
  //each enum key has an array of values
  //i.e. {registeredFrom: ['WEB', 'MOBILE'], stages: ['REGISTERED','QUEUE',...]}
  app.route('/api/enum/candidates')
    .get(candidates.listAllEnumValues)    
  
  //@desc returns list of enum values according to model field
  app.route('/api/enum/candidates/:field')
    .get(candidates.listEnumValues)    
    
  //@desc for specific candidate
  app.route('/api/candidates/:candidateId').all(candidatesPolicy.isAllowed)
    .get(candidates.read)
    .put(candidates.update)
    .delete(candidates.delete);    

  // Finish by binding the Candidate middleware
  app.param('candidateId', candidates.candidateByID);  
  // Finish by binding the Candidate middleware
  app.param('email', candidates.candidateByEmail);  

};
