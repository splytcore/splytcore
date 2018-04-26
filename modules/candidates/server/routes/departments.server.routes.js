'use strict';

/**
 * Module dependencies
 */
let departments = require('../controllers/departments.server.controller')
let departmentsPolicy = require('../policies/departments.server.policy')

module.exports = function(app) {  

  //@desc returns all departments
  app.route('/api/departments').all(departmentsPolicy.isAllowed)    
    .get(departments.list)
    .post(departments.create)

  //@desc returns all positions under a departmentId
  app.route('/api/departments/:departmentId/positions')    
    .get(departments.listPositions)

  app.route('/api/departments/:departmentId').all(departmentsPolicy.isAllowed)    
    .get(departments.read)
    .put(departments.update)
    .delete(departments.delete)   

  app.param('departmentId', departments.byID)
}
