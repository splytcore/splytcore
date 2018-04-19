'use strict';

/**
 * Module dependencies
 */

let appointments = require('../controllers/appointments.server.controller')

module.exports = function(app) {
  
  //create schedule per all dept
  app.route('/api/appointments/init')
    .get(appointments.createAppointmentScheduleForAllDepartment)

  //create schedule per dept  
  app.route('/api/appointments/department/:department/open')
    .get(appointments.listByOpenApptsAndDept)

  app.route('/api/appointments/department/:department/closed')
    .get(appointments.listByClosedApptsAndDept)

  app.route('/api/appointments/createSchedule/:department')
    .get(appointments.createAppointmentScheduleByDepartment)

  //@desc this sets new reference to the candidate
  app.route('/api/appointments/oldAppointment/:appointmentId/newAppointment/:newAppointmentId')    
    .get(appointments.update) 

  app.route('/api/appointments')
    .get(appointments.list) 

  app.route('/api/appointments/:appointmentId')
    .get(appointments.read)     

  //@desc this does not delete the appointment. It remove reference to the candidate
  // app.route('/api/appointments/:appointmentId')    
  //   .delete(appointments.delete) 

   app.param('appointmentId', appointments.byID);  

}
