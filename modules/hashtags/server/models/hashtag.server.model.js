'use strict';

/**
 * Module dependencies.
 */
var mongoose = require('mongoose'),
  Schema = mongoose.Schema;

/**
 * Hashtag Schema
 */
var HashtagSchema = new Schema({
  name: {
    type: String,
    default: '',
    required: 'Please fill Hashtag name',
    trim: true,
    unique: true
  },
  created: {
    type: Date,
    default: Date.now
  },
  asset: {
    type: Schema.ObjectId,
    ref: 'Asset',
    required: 'Asset is required'
  },  
  affiliate: {
    type: Schema.ObjectId,
    ref: 'User',
    required: 'Affiliate is required'
  }
});

// HashtagSchema.index({ name: 1, asset: 1, affiliate: 1 }, { unique: true })
mongoose.model('Hashtag', HashtagSchema);
