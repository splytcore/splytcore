'use strict';

/**
 * Not Used
 * Module dependencies.
 */
let mongoose = require('mongoose')
let Schema = mongoose.Schema

/**
 * Top Sellers Schema
 * Temporary collections for creating report
 */
var TopSellersSchema = new Schema({
  created: {
    type: Date,
    default: Date.now
  },  
  reportId: {
    type: Number,
    required: true 
  },    
  asset: {
    type: Schema.ObjectId,
    ref: 'Asset'
  },
  quantity: {
    type: Number,
    default: 0
  },  
})

mongoose.model('TopSellers', TopSellersSchema);
