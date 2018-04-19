'use strict';

/**
 * Module dependencies
 */

let appointments = require('../controllers/appointments.server.controller')

module.exports = function(app) {
  
  //setup after config departments are set
  //create schedule per all dept
  app.route('/api/appointments/init')
    .get(appointments.createAppointmentScheduleForAllDepartment)

  app.route('/api/appointments/createSchedule/:department')
    .get(appointments.createAppointmentScheduleByDepartment)
  //end setup

  //create schedule per dept  
  app.route('/api/appointments/department/:department/open')
    .get(appointments.listByOpenApptsAndDept)

  app.route('/api/appointments/department/:department/closed')
    .get(appointments.listByClosedApptsAndDept)

  //@desc this sets new appointment with reference to the candidate
  //It removes candidate reference from old appt so it will be open to use
  //remove :candidateId after change to type 'put'
  app.route('/api/appointments/:appointmentId/:candidateId')    
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
