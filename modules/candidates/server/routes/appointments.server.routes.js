'use strict';

/**
 * Module dependencies
 */

let appointments = require('../controllers/appointments.server.controller')

module.exports = function(app) {
  
  //setup after config departments are set
  //create schedule for all depts
  app.route('/api/appointments/init')
    .get(appointments.dropCollection, appointments.createAppointmentScheduleForAllDepartment)
  
  //create schedule per dept  
  app.route('/api/appointments/createSchedule/:department')
    .get(appointments.createAppointmentScheduleByDepartment)
  //end setup

  
  app.route('/api/appointments/department/:department/open')
    .get(appointments.listByOpenApptsAndDept)

  app.route('/api/appointments/department/:department/closed')
    .get(appointments.listByClosedApptsAndDept)

  app.route('/api/appointments')
    .get(appointments.list) 

  //@desc this sets new appointment with reference to the candidate
  //It removes candidate reference from old appt so it will be open to use  
  app.route('/api/appointments/:appointmentId')    
    .get(appointments.read)     
    .put(appointments.update) 
    .delete(appointments.delete)  //this doesn't delete object. Just removes candidate from the reference so appt will be open to use

   app.param('appointmentId', appointments.byID);  

}
