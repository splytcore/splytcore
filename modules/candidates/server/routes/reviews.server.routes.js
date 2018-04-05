'use strict';

/**
 * Module dependencies
 */
let reviewsPolicy = require('../policies/reviews.server.policy')
let reviews = require('../controllers/reviews.server.controller')

module.exports = function(app) {  

  app.route('/api/reviews').all(reviewsPolicy.isAllowed)  
    .get(reviews.list)

  app.route('/api/reviews/reviewId').all(reviewsPolicy.isAllowed)  
    .get(reviews.read)
  
  app.route('/api/candidates/:candidateId/review').all(reviewsPolicy.isAllowed)
    .post(reviews.create)
    .get(reviews.findByCandidateId)
    .put(reviews.update)
    .delete(reviews.delete)   

  // Finish by binding the Candidate middleware
  app.param('reviewId', reviews.byID);  

};
