'use strict';

/**
 * Module dependencies.
 */
var mongoose = require('mongoose'),
  Schema = mongoose.Schema;

/**
 * Analytic Schema
 */
var AnalyticSchema = new Schema({
  name: {
    type: String,
    default: '',
    required: 'Please fill Analytic name',
    trim: true
  },
  created: {
    type: Date,
    default: Date.now
  },
  user: {
    type: Schema.ObjectId,
    ref: 'User'
  }
});

mongoose.model('Analytic', AnalyticSchema);
