'use strict';

angular.module('core').filter('ArbitrationActionsFilter', () => {

    return function(actions, s) {

      var out = []

      let status =  parseInt(s)          

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
