'use strict';

/**
 * Module dependencies
 */

let appointments = require('../controllers/appointments.server.controller')

module.exports = function(app) {
  
  app.route('/api/appointments/createSchedule/:department')
    .get(appointments.createAppointmentSchedule)


  app.route('/api/appointments')
    .get(appointments.list) 

  // app.route('/api/appointments/:appointmentId')
  //   .get(appointments.read) 


  // app.param('appointmentId', appointments.byID);  

}
