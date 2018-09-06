'use strict';

/**
 * Module dependencies.
 */
var mongoose = require('mongoose'),
  Schema = mongoose.Schema;

/**
 * Order Schema
 */
var OrderSchema = new Schema({
  created: {
    type: Date,
    default: Date.now
  },
  asset: {
    type: Schema.ObjectId,
    ref: 'Asset'
  },
  //buyer
  user: {
    type: Schema.ObjectId,
    ref: 'User'
  }
});

mongoose.model('Order', OrderSchema);
