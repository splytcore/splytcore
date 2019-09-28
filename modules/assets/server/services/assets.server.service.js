'use strict';

const path = require('path')
const EthService = require(path.resolve('./modules/eth/server/services/eth.server.service'))


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