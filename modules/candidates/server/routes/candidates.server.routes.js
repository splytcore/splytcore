'use strict';

/**
 * Module dependencies
 */
var candidatesPolicy = require('../policies/candidates.server.policy'),
  candidates = require('../controllers/candidates.server.controller');

module.exports = function(app) {
  // Candidates Routes
  
  app.route('/api/checkin')
    .post(candidates.checkin) 

  app.route('/api/register')
    .post(candidates.register)   

  app.route('/api/findCandidate')
    .get(candidates.findCandidate)   

  app.route('/api/candidates')
    .get(candidates.list)    

  app.route('/api/uploadResume')
    .post(candidates.uploadResume)    

  app.route('/api/enum/candidates/stages')
    .get(candidates.listEnumStages)    

  app.route('/api/enum/candidates/statuses')
    .get(candidates.listEnumStatuses)    

  app.route('/api/candidates/:candidateId').all(candidatesPolicy.isAllowed)
    .get(candidates.read)
    .put(candidates.update)
    .delete(candidates.delete);    

  // Finish by binding the Candidate middleware
  app.param('candidateId', candidates.candidateByID);  
};
