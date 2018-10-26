'use strict';

angular.module('core').filter('ArbitrationActionsFilter', () => {

    return function(actions, s) {

      // let actions = [ 
      //   { id: 1,name: 'Set2x Stake By Seller(You must be the seller)'},
      //   { id: 2,name: 'Set2x Stake by Reporter(You must be original reporter)'},
      //   { id: 3,name: 'Set Arbitrator as yourself'},
      //   { id: 4,name: 'Set Winner'}
      // ]

      console.log('sttus: ' + s)
      console.log(actions)

      var out = []

      let status =  parseInt(s)         

      status =  3         

      actions.forEach((action, i) => {
        let actionId = parseInt(action.id)
        
        if (status == 0) {   
          if (actionId == 1) {
            out.push(action)
          }
        }

        if (status == 1) {   
          if (actionId == 2) {
            out.push(action)
          } 
        }

        if (status == 2) {   
          if (actionId == 3) {
            out.push(action)
          } 
        }

        if (status == 3) {   
          if (actionId == 4) {
            out.push(action)
          } 
        }

      })

      return out
    }

})
