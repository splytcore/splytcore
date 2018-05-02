'use strict';

/**
 * Module dependencies
 */

let appointments = require('../controllers/appointments.server.controller')
let appointmentsPolicy = require('../policies/appointments.server.policy')

module.exports = function(app) {
  
  //setup after config departments are set
  //create schedule for all depts
  app.route('/api/appointments/init').all(appointmentsPolicy.isAllowed)
    .post(appointments.createAppointmentScheduleForAllDepartment)
    .delete(appointments.dropCollection)
  
  //create/delete schedule per dept  
  app.route('/api/appointments/manage/:departmentId').all(appointmentsPolicy.isAllowed)
    .post(appointments.createAppointmentScheduleByDepartment)
    .delete(appointments.deleteAppointmentScheduleByDepartment)
  //end setup

  //Twilio calls this api when candidate cancels by SMS
  app.route('/api/appointments/cancelBySMS')
    .post(appointments.cancelBySMS)    

  app.route('/api/appointments/department/:department/open').all(appointmentsPolicy.isAllowed)
    .get(appointments.listByOpenApptsAndDept)

  app.route('/api/appointments/department/:department/closed')
    .get(appointments.listByClosedApptsAndDept)

  app.route('/api/appointments').all(appointmentsPolicy.isAllowed)
    .get(appointments.list) 
    

  //@desc this sets new appointment with reference to the candidate
  //It removes candidate reference from old appt so it will be open to use  
  app.route('/api/appointments/:appointmentId').all(appointmentsPolicy.isAllowed)    
    .get(appointments.read)     
    .put(appointments.update) 
    .delete(appointments.delete)  //this doesn't delete object. Just removes candidate from the reference so appt will be open to use

   app.param('appointmentId', appointments.byID);  

}
