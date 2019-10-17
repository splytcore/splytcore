'use strict';

const path = require('path')
const EthService = require(path.resolve('./modules/eth/server/services/eth.server.service'))
const mongoose = require('mongoose')
const Asset = mongoose.model('Asset')

exports.createAsset = (asset, callback) => {
  
  console.log('assetId: ' + asset._id)
  EthService.createAsset(asset)
    .on('transactionHash', function(hash){
      console.log('transactionHash: ' + hash)
      asset.transactionHash = hash
      asset.save( err => {
        if (err) {
          callback(err)
        } else {
          callback(null, asset)
        }
      })
    })
    .on('receipt', function(receipt) {
      // On mined
      console.log('only receipt: ', receipt)
    })
    .on('error', function (err) {
      //On error
      console.log('error creating asset contract', err.toString())
    }
  )
}

exports.decorateTokenBalance = function(tokenBalanceDecimal) {
  var decimal
  var whole
  if (tokenBalanceDecimal.length > 4) {
    decimal = tokenBalanceDecimal.substring(tokenBalanceDecimal.length - 4)
    whole = tokenBalanceDecimal.substring(0, tokenBalanceDecimal.length - 4)
    whole = whole.replace(/\B(?=(\d{3})+(?!\d))/g, ",")
    console.log('decorated token balance: ', whole + '.' + decimal)
    return whole + '.' + decimal
  } else {
    decimal = tokenBalanceDecimal
    return '0.' + decimal
  }

}

exports.findByTitle = function(title, cb) {
  console.log('find by title: ', title)
  Asset.find({ title: title }).sort({ created: -1}).limit(1).exec((err, asset) => {
    if(err) {
      console.log(err)
      cb(null)
    } else {
      console.log('Find asset by title: ', asset)
      if(asset.length > 0)
        EthService.getAssetInfoByAssetId(asset[0]._id)
        .then(info => {
          cb(info[0])
        })
      else
        cb(null)
    }
  })
}