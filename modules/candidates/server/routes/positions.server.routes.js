'use strict';

/**
 * Module dependencies
 */
let positions = require('../controllers/positions.server.controller')

module.exports = function(app) {  

  app.route('/api/positions/init')
    .get(positions.initialize)

  app.route('/api/positions')
    .get(positions.list)
    .post(positions.create)

  app.route('/api/positions/:positionId/department')
    .get(positions.readDepartment)

  app.route('/api/positions/:positionId')    
    .get(positions.read)
    .put(positions.update)
    .delete(positions.delete)   

  app.param('positionId', positions.byID)
}
