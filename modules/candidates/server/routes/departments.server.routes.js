'use strict';

/**
 * Module dependencies
 */
let departments = require('../controllers/departments.server.controller')

module.exports = function(app) {  

  app.route('/api/departments')
    .get(departments.list)
    .post(departments.create)

  app.route('/api/departments/:departmentId')    
    .get(departments.read)
    .put(departments.update)
    .delete(departments.delete)   

  app.param('departmentId', departments.byID)
}
