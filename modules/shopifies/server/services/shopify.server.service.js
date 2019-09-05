'use strict';

const mongoose = require('mongoose'),
      Asset = mongoose.model('Asset')

exports.convertToAsset = (shopifyProduct, callback) => {
  console.log(shopifyProduct)
  const asset = new Asset()
  asset.title = shopifyProduct.title
  asset.inventoryCount = shopifyProduct.variants[0].inventory_quantity
  asset.imageUrl = shopifyProduct.images[0].src
  asset.totalCost = shopifyProduct.variants[0].price
  asset.description = shopifyProduct.body_html
  console.log(asset)
  callback(asset)
}