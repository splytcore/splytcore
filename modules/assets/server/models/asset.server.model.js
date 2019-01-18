'use strict';

/**
 * Module dependencies.
 */
var mongoose = require('mongoose'),
  Schema = mongoose.Schema;

/**
 * Reward Schema
 */
var AssetSchema = new Schema({
  title: {
    type: String,
    default: 'Fake Asset #' + Date.now,
    required: 'Please fill title',
    trim: true
  },  
  description: {
    type: String,
    default: '',
    required: 'Please fill description',
    trim: true
  },  
  created: {
    type: Date,
    default: Date.now
  },
  expDate: {
    type: Date,
    default: new Date(+new Date() + 365*24*60*60*1000)
  },  
  inventoryCount: {
    type: Number,
    default: 2
  },
  status: {
    type: String,
    default: '0'
  },
  imageURL: {
    type: String,
    default: 'modules/assets/client/img/asset.jpeg'
  },     
  price: {
    type: Number
  },  
  //seller     
  user: {
    type: Schema.ObjectId,
    ref: 'User'
  },
  category: {
    type: Schema.ObjectId,
    ref: 'Category'
  }
});

mongoose.model('Asset', AssetSchema);
