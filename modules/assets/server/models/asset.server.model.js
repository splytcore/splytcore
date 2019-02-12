'use strict';

/**
 * Module dependencies.
 */
var mongoose = require('mongoose'),
  Schema = mongoose.Schema;

/**
 * Asset Schema
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
  inventoryCount: {
    type: Number,
    default: 1
  },
  status: {
    type: String,
    default: 'active',
    enum: [ 'active', 'in_arbitration', 'expired', 'sold_out', 'closed', 'other']
  },
  imageURL: [{
    type: String,
    default: 'modules/assets/client/img/asset.jpeg'
  }],     
  price: {
    type: Number,
    default: 0
  },  
  //seller     
  user: {
    type: Schema.ObjectId,
    ref: 'User'
  },
  category: {
    type: Schema.ObjectId,
    ref: 'Category'
  },
  brand: {
    type: String,
    trim: true
  },
  //transient
  hashtags: [{
    type: Schema.ObjectId,
    ref: 'Hashtag'
  }],
  sku: {
    type: String,
    trim: true
  },
  views: {
    type: Number,
    default: 0
  },
  buys: {
    type: Number,
    default: 0
  },
  reward: {
    type: Number,
    required: 'Reward is required, 0-100',
    min: 0,
    max: 100
  }       
})

// AssetSchema.post('init', function(asset, next) {
//   console.log('TODO: bind asset transients here')
//   next()
// })

mongoose.model('Asset', AssetSchema);
