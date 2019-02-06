'use strict';

/**
 * Module dependencies.
 */
const mongoose = require('mongoose')
const Schema = mongoose.Schema
const OrderItem = mongoose.model('OrderItem')


/**
 * Order Schema
 */
let OrderSchema = new Schema({
  created: {
    type: Date,
    default: Date.now
  },
  status: {
    type: String,
    enum: ['pending', 'settled', 'refund_requested', 'refunded'],
    default: 'pending' 
  },    
  totalQuantity: {
    type: Number,
    default: 0
  },
  tax: {
    type: Number,
    default: 0
  },     
  totalCost: {
    type: Number,
    default: 0
  },   
  //customer
  customer: {
    type: Schema.ObjectId,
    ref: 'User'
  },
  cart: {
    type: Schema.ObjectId,
    ref: 'Cart'
  }, 
  billing: {   
    address1: {
      type: String,
      required: 'Address 1 is required'
    },
    address2: {
      type: String
    },   
    city: {
      type: String,
      required: 'City is required'
    },   
    state: {
      type: String,
      required: 'State is required'
    },   
    zip: {
      type: String,
      required: 'Zip is required'
    } 
  },   
  shipping: {
    address1: {
      type: String,
      required: 'Address 1 is required'
    },    
    address2: {
      type: String
    },   
    city: {
      type: String,
      required: 'City is required'
    },   
    state: {
      type: String,
      required: 'State is required'
    },   
    zip: {
      type: String,
      required: 'Zip is required'
    } 
  },   
  items: [{
    type: Schema.ObjectId,
    ref: 'OrderItem'
  }],
  stripeToken: {
    type: String,
    default: ''
  }
})


OrderSchema.index({
  created: -1
})


//Bind order items
OrderSchema.post('init', function(order, next) {
  OrderItem.find({ order: order.id }).populate('asset').exec((err, items) => {
    order.items = items
    next()
  })
})

mongoose.model('Order', OrderSchema);

