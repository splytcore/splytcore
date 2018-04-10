'use strict';

/**
 * Module dependencies.
 */
const mongoose = require('mongoose')
const Schema = mongoose.Schema
const path = require('path')
const config = require(path.resolve('./config/config'))
const validator = require('validator')

/**

 * Department Schema
 */
const DepartmentSchema = new Schema({
  name: {
    type: String,    
    uppercase: true,
    required: 'Please select name'    
  },
  display: {
    type: String    
  }
})


mongoose.model('Department', DepartmentSchema)
