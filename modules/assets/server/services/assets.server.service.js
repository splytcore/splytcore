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
      // .on('confirmation', function(confirmationNumber, receipt){
      //   console.log('confirmation: ' + confirmationNumber)
      //   console.log('receipt: ' + receipt)
      // })
      .on('receipt', function(receipt) {
        //after it's mined
        console.log('only receipt: ')
        console.log(receipt)
      })
      .on('error', function (err) {
        console.log('error creating asset contract')
        console.log(err.toString())
        callback({ message : err.toString() })
      }
    )
  }