'use strict';

/**
 * Module dependencies
 */

let reviews = require('../controllers/reviews.server.controller')
let reviewsPolicy = require('../policies/reviews.server.policy')

module.exports = function(app) {  

  app.route('/api/reviews').all(reviewsPolicy.isAllowed)    
    .get(reviews.list)

  app.route('/api/reviews/:candidateId').all(reviewsPolicy.isAllowed)
    .post(reviews.create)
    .get(reviews.byCandidate, reviews.read)
    .put(reviews.byCandidate, reviews.update)
    .delete(reviews.byCandidate, reviews.delete)   

}
