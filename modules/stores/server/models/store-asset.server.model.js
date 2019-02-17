'use strict';

/**
 * Module dependencies.
 */
const mongoose = require('mongoose')
const Schema = mongoose.Schema
const deepPopulate = require('mongoose-deep-populate')(mongoose)

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

StoreAssetSchema.plugin(deepPopulate)

StoreAssetSchema.index({ store: 1, asset: 1 }, { unique: true })
mongoose.model('StoreAsset', StoreAssetSchema)



