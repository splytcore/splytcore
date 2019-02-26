'use strict';

/**
 * Module dependencies.
 */
const mongoose = require('mongoose')
const Schema = mongoose.Schema

/**
 * Store Schema
 */
let StoreSchema = new Schema({
  name: {
    type: String,
    default: '',
    required: 'Please fill Store name',
    trim: true,
    unique: true
  },
  description: {
    type: String,
    default: ''
  },  
  created: {
    type: Date,
    default: Date.now
  },
  categories: [{
    type: Schema.ObjectId,
    ref: 'Category'
  }],   
  //transient field
  storeAssets: [{
    type: Schema.ObjectId,
    ref: 'StoreAsset'
  }],  
  affiliate: {
    type: Schema.ObjectId,
    ref: 'User'
  },
  views: {
    type: Number,
    default: 0
  }
})


mongoose.model('Store', StoreSchema)



