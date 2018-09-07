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
    default: '',
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
  term: {
    type: Number,
    default: 0
  },  
  //seller wallet
  seller: {
    type: String
  }, 
  marketPlaces: [{
    type: String,
    default: '0x427A21A69C3D7949b4ECEd0437Df91ee01c255d6'
  }],  
  marketPlacesAmount: [{
    type: Number,
    default: 2
  }],
  inventoryCount: {
    type: Number,
    default: 2
  },        
  //contract address
  address: {
    type: String,
    default: ''
  },       
  totalCost: {
    type: Number,
    default: 100000
  },      
  user: {
    type: Schema.ObjectId,
    ref: 'User'
  }
});

mongoose.model('Asset', AssetSchema);
