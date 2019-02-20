'use strict';

/**
 * Not Used
 * Module dependencies.
 */
const mongoose = require('mongoose')
const Schema = mongoose.Schema

/**
 * Top Sellers Schema
 * Temporary collections for creating report
 */
var SellerSalesSummarySchema = new Schema({
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
  hashtag: {
    type: Schema.ObjectId,
    ref: 'Hashtag'
  },  
  quantity: {
    type: Number,
    default: 0
  },  
  sales: {
    type: Number,
    default: 0
  },
  commission: {
    type: Number,
    default: 0
  },
  profits: {
    type: Number,
    default: 0
  }
})

mongoose.model('SellerSalesSummary', SellerSalesSummarySchema)
