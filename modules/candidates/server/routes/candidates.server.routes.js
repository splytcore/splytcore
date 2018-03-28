'use strict';

/**
 * Module dependencies
 */
let candidatesPolicy = require('../policies/candidates.server.policy')
let candidates = require('../controllers/candidates.server.controller')

module.exports = function(app) {
  // Candidates Routes
  
  app.route('/api/checkin')
    .post(candidates.checkin) 
            
  app.route('/api/register/MOBILE')
    .post(candidates.uploadImageResume, candidates.mergeImagesToPDF, candidates.register)   
             
  app.route('/api/register/WEB')
    .post(candidates.uploadDocResume, candidates.register)       

  app.route('/api/candidateByEmail/:email')
    .get(candidates.findByEmail)   

  //find candidates by email, last name, sms
  //i.e. /api/findCandidate?q=john@gmail.com
  //i.e. /api/findCandidate?q=smith
  //i.e. /api/findCandidate?q=81812345678
  app.route('/api/findCandidate/:search')
    .get(candidates.findCandidate)   

  app.route('/api/validatePhone/:phone')
    .get(candidates.validatePhone)    

  app.route('/api/candidates')
    .get(candidates.list)    

  //returns list of enum all
  app.route('/api/enum/candidates')
    .get(candidates.listAllEnumValues)    
  
  //returns list of enum values according to model field
  app.route('/api/enum/candidates/:field')
    .get(candidates.listEnumValues)    
    
  app.route('/api/candidates/:candidateId').all(candidatesPolicy.isAllowed)
    .get(candidates.read)
    .put(candidates.update)
    .delete(candidates.delete);    

  // Finish by binding the Candidate middleware
  app.param('candidateId', candidates.candidateByID);  
  // Finish by binding the Candidate middleware
  app.param('email', candidates.candidateByEmail);  

};
