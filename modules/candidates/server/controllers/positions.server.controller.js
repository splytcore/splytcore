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

  // async.waterfall([
  //   function createDepartment(next){
  //     async.each(departments, (department, callback) => {    
  //       Department.findOneAndUpdate({name: 'd'})
  //       callback()
  //     }, (err) => {
  //       next()
  //     })
  //   },
  //   function createPosition(next){
  //     async.each(department, (position, cb2) => {        
  //       console.log(position)
  //       cb2()
  //     }, (err) => {
  //       if(err) {
  //         return res.status(400).send({ message: errorHandler.getErrorMessage(err) })
  //       }             
  //       console.log('finished with')    
  //       callback()
  //     })

  //     }
  // ], (err) => {
  //   if (err) {
  //     console.log(err)
  //     return res.status(400).send({ message: errorHandler.getErrorMessage(err) })
  //   } 
  // })    ]


  async.each(departments, (key, department, callback) => {        
    console.log(key)
    async.each(department, (position, cb2) => {      
      console.log(position)
      cb2()
    }, (err) => {
      if(err) {
        return res.status(400).send({ message: errorHandler.getErrorMessage(err) })
      }             
      console.log('finished with')    
      callback()
    })
  }, (err) => {
    if(err) {
      return res.status(400).send({ message: errorHandler.getErrorMessage(err) })
    }             
    console.log('finished')
    res.jsonp({ message: 'success' })
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