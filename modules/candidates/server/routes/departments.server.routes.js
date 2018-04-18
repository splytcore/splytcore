'use strict';

/**
 * Module dependencies
 */
let departments = require('../controllers/departments.server.controller')

module.exports = function(app) {  

  //@desc returns all departments
  app.route('/api/departments')
    .get(departments.list)
    .post(departments.create)

  //@desc returns all positions under a departmentId
  app.route('/api/departments/:departmentId/positions')    
    .get(departments.listPositions)

  app.route('/api/departments/:departmentId')    
    .get(departments.read)
    .put(departments.update)
    .delete(departments.delete)   

  app.param('departmentId', departments.byID)
}
