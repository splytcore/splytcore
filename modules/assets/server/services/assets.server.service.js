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