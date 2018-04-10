'use strict';

/**
 * Module dependencies.
 */
const path = require('path')
const mongoose = require('mongoose')
const async = require('async')
const Position = mongoose.model('Position')  
const Department = mongoose.model('Department')  
const errorHandler = require(path.resolve('./modules/core/server/controllers/errors.server.controller'))
const _ = require('lodash')
const config = require(path.resolve('./config/config'))


//@desc creates new departments and positions that doesn't exists
exports.initialize = function(req, res) {
  
  let departments = config.departments  

  async.forEachOf(departments, (rec, departmentName, callback) => {        
    createDepartment(departmentName, rec.display)
      .then((dept) => {
        console.log(dept)
        createPositions(dept, rec.positions)
          .then(() => {
            callback()
          })
          .catch((err)=> {
            callback(err)
          })
      })
      .catch((err) => {
        callback(err)
      })
  }, (err) => {        
    if (err) {
      return res.status(400).send({
        message: errorHandler.getErrorMessage(err)
      })
    }
    res.jsonp({ message: 'success' })    
  })    

}
//@desc create if not exists
function createDepartment(departmentName, display) {
  return new Promise((resolve, reject) => {
    Department.findOneAndUpdate({ name: departmentName.toUpperCase() }, { name: departmentName.toUpperCase(), display: display }, { upsert: true, new: true }).exec((err, dept) => {          
      if (err) {
        reject(err)
      } else {      
        console.log(dept)
        resolve(dept)
      }
    })                
  })
}

//@desc create if not exists
function createPositions(department, positions) {
  return new Promise((resolve, reject) => {
    async.each(positions, (position, callback) => {    
      Position.findOneAndUpdate({ name: position.name.toUpperCase() }, { department: department, name: position.name.toUpperCase(), display: position.display }, { upsert: true }).exec((err, pos) => {                  
        callback(err)
      })                
    }, (err) => {        
      if (err) {
        reject(err)
      } else {
        resolve()  
      }      
    })  
  })
}


exports.create = function(req, res) {
  
  let position = new Position(req.body)    
  position.save(function (err) {
    if (err) {
      return res.status(400).send({
        message: errorHandler.getErrorMessage(err)
      })
    } else {
      res.jsonp({ message: 'success' })
    }
  })
}



exports.read = function(req, res) {
  let position = req.position ? req.position.toJSON() : {}
  res.jsonp(position)
}

exports.delete = function(req, res) {
  let position = req.position

  position.remove(function (err) {
    if (err) {
      return res.status(400).send({
        message: errorHandler.getErrorMessage(err)
      });
    } else {
      res.jsonp({ message: 'success' });
    }
  })
}

exports.update = function(req, res) {
  
  let position = req.position
  position = _.extend(position, req.body)  
  position.save((err) => {
    if (err) {
      return res.status(400).send({
        message: errorHandler.getErrorMessage(err)
      })
    } else {
      res.jsonp({ message: 'success' })
    }
  })
}


exports.list = function(req, res) {  

  Position.find().populate('department').exec(function (err, positions) {
    if (err) {
      return res.status(400).send({
        message: errorHandler.getErrorMessage(err)
      })      
    }             
    res.jsonp(positions)        
  })
}


/**
 * Candidate middleware
 */
exports.byID = function(req, res, next, id) {
  
  if (!mongoose.Types.ObjectId.isValid(id)) {
    return res.status(400).send({
      message: 'Object is invalid'
    });
  }

  Position.findById(id).populate('department').exec(function (err, position) {
    if (err) {
      return next(err)
    } else if (!position) {
      return res.status(404).send({
        message: 'No Object with that identifier has been found'
      })
    }
    req.position = position
    next()
  })
}