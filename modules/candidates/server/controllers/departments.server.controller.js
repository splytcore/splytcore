'use strict';

/**
 * Module dependencies.
 */
const path = require('path')
const mongoose = require('mongoose')
const async = require('async')
const Department = mongoose.model('Department')  
const Position = mongoose.model('Position')  
const errorHandler = require(path.resolve('./modules/core/server/controllers/errors.server.controller'))
const _ = require('lodash')
const config = require(path.resolve('./config/config'))

exports.create = function(req, res) {
  
  let department = new Department(req.body)    
  department.save(function (err) {
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
  let department = req.department ? req.department.toJSON() : {}
  res.jsonp(department)
}

exports.delete = function(req, res) {
  let department = req.department

  department.remove(function (err) {
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
  
  let department = req.department
  department = _.extend(department, req.body)  
  department.save((err) => {
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

  Department.find().exec(function (err, departments) {
    if (err) {
      return res.status(400).send({
        message: errorHandler.getErrorMessage(err)
      })      
    }             
    res.jsonp(departments)        
  })
}

//@desc list all positions for givent departmentId
exports.listPositions = function(req, res) {  

  let dept = req.department
  Position.find({ department: dept }).exec(function (err, positions) {
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

  Department.findById(id).exec(function (err, department) {
    if (err) {
      return next(err)
    } else if (!department) {
      return res.status(404).send({
        message: 'No Object with that identifier has been found'
      })
    }
    req.department = department
    next()
  })
}