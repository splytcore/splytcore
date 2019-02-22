'use strict';

/**
 * Module dependencies.
 */
const mongoose = require('mongoose')
const Schema = mongoose.Schema
const deepPopulate = require('mongoose-deep-populate')(mongoose)
/**
 * Group Assets Schema
 * Temporary Collection to hold items from instagram
 */
let InstagramAssetsSchema = new Schema({
  overviewImageUrl: {
    type: String
  },
  assets: [{
    id: {
      type: String
    },
    title: {
      type: String,
      default: ''
    },
    imageURL: {
      type: [String],
      default: ''  
    },
    price: {
      type: Number
    },
    description: {
      type: String
    },
    inventoryCount: {
      type: Number
    },
    brand: {
      type: String
    }
  }]
})


// InstgramAssetsSchema.index({ cart: 1, asset: 1 }, { unique: true })
InstagramAssetsSchema.plugin(deepPopulate)
mongoose.model('InstagramAssets', InstagramAssetsSchema)
