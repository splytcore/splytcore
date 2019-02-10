'use strict';

/**
 * Module dependencies.
 */
const mongoose = require('mongoose')
const Schema = mongoose.Schema

/**
 * Store Asset Schema
 */
let StoreAssetSchema = new Schema({
  store: {
    type: Schema.ObjectId,
    ref: 'Store',
    required: true
  },
  asset: {
    type: Schema.ObjectId,
    ref: 'Asset',
    required: true
  },
  created: {
    type: Date,
    default: Date.now
  }  
})

StoreAssetSchema.index({ store: 1, asset: 1 }, { unique: true })
mongoose.model('StoreAsset', StoreAssetSchema)



